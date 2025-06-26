import fs from 'fs';
import path from 'path';

export interface ContactInfo {
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  socialMedia: {
    instagram: string;
    youtube: string;
    linkedin: string;
    facebook: string;
  };
  lastModified: string;
  modifiedBy: string;
}

const CONTACT_FILE = path.join(process.cwd(), 'data', 'contact-info.json');

// Default contact information
const DEFAULT_CONTACT: ContactInfo = {
  address: {
    street: "323, Acad Block 4, IIT Gandhinagar",
    city: "Palaj, Gandhinagar",
    state: "Gujarat",
    postalCode: "382355",
    country: "India"
  },
  phone: "+91-79-2395-2001",
  email: "technical.secretary@iitgn.ac.in",
  socialMedia: {
    instagram: "https://www.instagram.com/tech_iitgn?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    youtube: "https://www.youtube.com/@tech_iitgn",
    linkedin: "https://www.linkedin.com/school/tech-council-iitgn/",
    facebook: "https://www.facebook.com/tech.iitgn"
  },
  lastModified: new Date().toISOString(),
  modifiedBy: "System"
};

// In-memory storage for production environments where filesystem is read-only
let productionContactInfo: ContactInfo = { ...DEFAULT_CONTACT };

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Ensure data directory exists
function ensureDataDirectory() {
  if (isDevelopment) {
    const dataDir = path.dirname(CONTACT_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }
}

// Get contact information
export async function getContactInfo(): Promise<ContactInfo> {
  try {
    if (!isDevelopment) {
      // In production, return in-memory contact info
      return productionContactInfo;
    }

    ensureDataDirectory();
    
    if (!fs.existsSync(CONTACT_FILE)) {
      // Create default contact file if it doesn't exist
      await saveContactInfo(DEFAULT_CONTACT);
      return DEFAULT_CONTACT;
    }

    const data = fs.readFileSync(CONTACT_FILE, 'utf-8');
    const contactInfo = JSON.parse(data);
    
    // Merge with defaults to ensure all fields exist
    return {
      ...DEFAULT_CONTACT,
      ...contactInfo,
      address: {
        ...DEFAULT_CONTACT.address,
        ...contactInfo.address
      },
      socialMedia: {
        ...DEFAULT_CONTACT.socialMedia,
        ...contactInfo.socialMedia
      }
    };
  } catch (error) {
    console.error('Error reading contact info:', error);
    return DEFAULT_CONTACT;
  }
}

// Save contact information with atomic write
export async function saveContactInfo(contactInfo: ContactInfo): Promise<ContactInfo> {
  try {
    const updatedContact = {
      ...contactInfo,
      lastModified: new Date().toISOString()
    };

    if (isDevelopment) {
      ensureDataDirectory();
      
      // Atomic write operation
      const tempFile = `${CONTACT_FILE}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(updatedContact, null, 2));
      fs.renameSync(tempFile, CONTACT_FILE);
    } else {
      // In production, update in-memory storage
      productionContactInfo = updatedContact;
    }

    return updatedContact;
  } catch (error) {
    console.error('Error saving contact info:', error);
    throw new Error('Failed to save contact information');
  }
}

// Update specific contact field
export async function updateContactField(field: string, value: unknown, modifiedBy: string): Promise<ContactInfo> {
  try {
    const currentContact = await getContactInfo();
    
    // Handle nested field updates
    const updatedContact = { ...currentContact };
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (parent === 'address') {
        updatedContact.address = {
          ...updatedContact.address,
          [child]: value as string
        };
      } else if (parent === 'socialMedia') {
        updatedContact.socialMedia = {
          ...updatedContact.socialMedia,
          [child]: value as string
        };
      }
    } else {
      // For top-level fields, we need to cast appropriately
      if (field === 'phone' || field === 'email') {
        (updatedContact as Record<string, unknown>)[field] = value;
      }
    }
    
    updatedContact.modifiedBy = modifiedBy;
    
    return await saveContactInfo(updatedContact);
  } catch (error) {
    console.error('Error updating contact field:', error);
    throw new Error('Failed to update contact information');
  }
}
