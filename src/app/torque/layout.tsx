import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Torque Magazine - Technical Council IITGN",
  description: "Read Torque, the annual flagship magazine of the Technical Council, IIT Gandhinagar showcasing innovation and research.",
}

export default function TorqueLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
