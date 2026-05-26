declare module "lucide-react" {
  import type { ForwardRefExoticComponent, RefAttributes, SVGProps } from "react";

  export type LucideProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
    absoluteStrokeWidth?: boolean;
    size?: number | string;
    strokeWidth?: number | string;
  };

  export type LucideIcon = ForwardRefExoticComponent<
    LucideProps & RefAttributes<SVGSVGElement>
  >;

  export const ArrowLeft: LucideIcon;
  export const Bot: LucideIcon;
  export const BriefcaseBusiness: LucideIcon;
  export const CalendarCheck: LucideIcon;
  export const Camera: LucideIcon;
  export const Check: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronLeft: LucideIcon;
  export const ChevronRight: LucideIcon;
  export const CircleUserRound: LucideIcon;
  export const Code2: LucideIcon;
  export const Compass: LucideIcon;
  export const Database: LucideIcon;
  export const Eye: LucideIcon;
  export const EyeOff: LucideIcon;
  export const FileText: LucideIcon;
  export const FolderKanban: LucideIcon;
  export const GraduationCap: LucideIcon;
  export const HelpCircle: LucideIcon;
  export const ImageIcon: LucideIcon;
  export const LayoutList: LucideIcon;
  export const LogOut: LucideIcon;
  export const Megaphone: LucideIcon;
  export const Menu: LucideIcon;
  export const Mic: LucideIcon;
  export const Monitor: LucideIcon;
  export const Moon: LucideIcon;
  export const MoreHorizontal: LucideIcon;
  export const Plus: LucideIcon;
  export const Rocket: LucideIcon;
  export const Save: LucideIcon;
  export const Search: LucideIcon;
  export const Send: LucideIcon;
  export const Settings: LucideIcon;
  export const Sparkles: LucideIcon;
  export const SquarePen: LucideIcon;
  export const Store: LucideIcon;
  export const Sun: LucideIcon;
  export const X: LucideIcon;
}
