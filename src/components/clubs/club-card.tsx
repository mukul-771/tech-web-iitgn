import Link from "next/link"
import Image from "next/image"

interface Club {
  id: string;
  name: string;
  description: string;
  type: "club" | "hobby-group" | "technical-council-group";
  category: string;
  logoPath?: string;
}

interface ClubCardProps {
  club: Club;
  variant?: "technical" | "hobby" | "council";
}

// Helper function to get logo path
const getLogoPath = (club: Club) => {
  if (club.logoPath) {
    return club.logoPath;
  }

  // Fallback to static logo mapping for existing clubs
  const logoMap: Record<string, string> = {
    // Technical Clubs
    'metis': '/logos/clubs/metis.jpeg',
    'digis': '/logos/clubs/digis.jpg',
    'mean-mechanics': '/logos/clubs/mean-mechanics.png',
    'odyssey': '/logos/clubs/odyssey.jpg',
    'grasp': '/logos/clubs/grasp.png',
    'machine-learning': '/logos/clubs/machine-learning.jpeg',
    'tinkerers-lab': '/logos/clubs/tinkerers-lab.png',
    'anveshanam': '/logos/clubs/anveshanam.png',

    // Hobby Groups
    'embed': '/logos/hobby-groups/embed.png',
    'blockchain-hobby': '/logos/hobby-groups/blockchain-hobby.png',
  }

  return logoMap[club.id] || null
}

// Get gradient colors based on variant
const getGradientColors = (variant: "technical" | "hobby" | "council") => {
  switch (variant) {
    case "technical":
      return {
        logo: "from-blue-600/20 to-purple-600/20",
        hover: "group-hover:text-blue-600"
      };
    case "hobby":
      return {
        logo: "from-purple-600/20 to-pink-600/20",
        hover: "group-hover:text-purple-600"
      };
    case "council":
      return {
        logo: "from-green-600/20 to-teal-600/20",
        hover: "group-hover:text-green-600"
      };
    default:
      return {
        logo: "from-blue-600/20 to-purple-600/20",
        hover: "group-hover:text-blue-600"
      };
  }
}

export function ClubCard({ club, variant = "technical" }: ClubCardProps) {
  const colors = getGradientColors(variant);

  return (
    <Link
      href={`/clubs/${club.id}`}
      className="group block touch-target"
    >
      <div className="flex flex-row items-start gap-3 sm:gap-4 mobile-card bg-white/10 dark:bg-white/5 backdrop-blur-md border-0 transition-all duration-300 hover:bg-white/20 hover:dark:bg-white/10 hover:shadow-lg hover:scale-105 hover:-translate-y-1">
        {/* Club Logo */}
        <div className={`flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br ${colors.logo} flex items-center justify-center overflow-hidden`}>
          {getLogoPath(club) ? (
            <Image
              src={getLogoPath(club)!}
              alt={`${club.name} logo`}
              width={64}
              height={64}
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                // Fallback to initials if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<div class="text-xl font-bold text-muted-foreground/80">${club.name.split(' ').map((word: string) => word[0]).join('')}</div>`;
                }
              }}
            />
          ) : (
            <div className="text-xl font-bold text-muted-foreground/80">
              {club.name.split(' ').map((word: string) => word[0]).join('').slice(0, 3)}
            </div>
          )}
        </div>

        {/* Club Info */}
        <div className="flex-1 min-w-0 text-left">
          <h3 className={`text-lg font-semibold mb-2 ${colors.hover} transition-colors line-clamp-2`}>
            {club.name}
          </h3>

          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {club.description}
          </p>
        </div>
      </div>
    </Link>
  );
}
