import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get file info
    const fileInfo = {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    };

    // Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Check file signature
    const signature = Array.from(buffer.slice(0, 16))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join(' ');

    const sharpResults: Record<string, unknown> = {};
    
    // Try different Sharp configurations
    const sharpConfigs = [
      { name: 'default', options: {} },
      { name: 'failOnError:false', options: { failOnError: false } },
      { name: 'unlimited:true', options: { unlimited: true } },
      { name: 'sequentialRead:true', options: { sequentialRead: true } },
      { name: 'combined', options: { failOnError: false, unlimited: true, sequentialRead: true } }
    ];

    for (const config of sharpConfigs) {
      try {
        console.log(`Testing Sharp config: ${config.name}`);
        const sharpInstance = sharp(buffer, config.options);
        const metadata = await sharpInstance.metadata();
        
        sharpResults[config.name] = {
          success: true,
          metadata: {
            format: metadata.format,
            width: metadata.width,
            height: metadata.height,
            channels: metadata.channels,
            space: metadata.space,
            density: metadata.density,
            hasAlpha: metadata.hasAlpha,
            orientation: metadata.orientation
          }
        };
        
        // If this config works, try a simple conversion
        try {
          const converted = await sharpInstance.jpeg({ quality: 85 }).toBuffer();
          // @ts-expect-error - This is a diagnostic tool
          sharpResults[config.name].conversionTest = {
            success: true,
            outputSize: converted.length
          };
        } catch (conversionError) {
          // @ts-expect-error - This is a diagnostic tool
          sharpResults[config.name].conversionTest = {
            success: false,
            error: conversionError instanceof Error ? conversionError.message : 'Unknown conversion error'
          };
        }
        
      } catch (error) {
        sharpResults[config.name] = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      fileInfo,
      bufferSize: buffer.length,
      signature,
      sharpResults,
      recommendations: generateRecommendations(sharpResults)
    });

  } catch (error) {
    console.error("Image analysis error:", error);
    return NextResponse.json(
      { 
        error: "Image analysis failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateRecommendations(results: Record<string, unknown>): string[] {
  const recommendations = [];
  
  const workingConfigs = Object.entries(results).filter(([, result]) => 
    typeof result === 'object' && result !== null && 'success' in result && result.success === true
  );
  
  if (workingConfigs.length === 0) {
    recommendations.push("No Sharp configuration worked - the image file may be corrupted or in an unsupported format");
    recommendations.push("Try saving the image in a different format (JPEG or PNG) using an image editor");
  } else {
    const bestConfig = workingConfigs.find(([, result]) => 
      typeof result === 'object' && result !== null && 'conversionTest' in result && 
      typeof result.conversionTest === 'object' && result.conversionTest !== null &&
      'success' in result.conversionTest && result.conversionTest.success === true
    );
    if (bestConfig) {
      recommendations.push(`Best working configuration: ${bestConfig[0]}`);
      recommendations.push("The image can be processed successfully");
    } else {
      recommendations.push("Image can be read but conversion fails");
      recommendations.push("Try reducing image size or saving in JPEG format");
    }
  }
  
  return recommendations;
}
