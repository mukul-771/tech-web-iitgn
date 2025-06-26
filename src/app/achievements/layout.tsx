import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements - Technical Council IITGN",
  description: "Explore the achievements and victories of Technical Council clubs in Inter-IIT Tech Meet, hackathons, and competitions.",
};

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
