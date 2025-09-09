import type {
  LucideProps} from 'lucide-react';
import {
  AlertCircle,
  BarChart3,
  Bell,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock,
  CreditCard,
  Download,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Heart,
  HelpCircle,
  Home,
  Info,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Minus,
  Phone,
  Plus,
  Save,
  Search,
  Settings,
  Share,
  Sort,
  Star,
  ThumbsUp,
  Trash2,
  Upload,
  User,
  Users,
  X,
} from 'lucide-react'

export type IconProps = LucideProps

// User & People Icons
export const UserIcon = User
export const UsersIcon = Users

// Navigation Icons
export const HomeIcon = Home
export const CalendarIcon = Calendar
export const FileTextIcon = FileText
export const BarChart3Icon = BarChart3
export const CreditCardIcon = CreditCard
export const SettingsIcon = Settings
export const LogOutIcon = LogOut

// Action Icons
export const EyeIcon = Eye
export const EyeOffIcon = EyeOff
export const CheckIcon = Check
export const XIcon = X
export const EditIcon = Edit
export const Trash2Icon = Trash2
export const DownloadIcon = Download
export const UploadIcon = Upload
export const SaveIcon = Save
export const PlusIcon = Plus
export const MinusIcon = Minus
export const SearchIcon = Search

// Status Icons
export const AlertCircleIcon = AlertCircle
export const InfoIcon = Info
export const StarIcon = Star
export const HeartIcon = Heart
export const ThumbsUpIcon = ThumbsUp

// Chevron Icons
export const ChevronDownIcon = ChevronDown
export const ChevronUpIcon = ChevronUp
export const ChevronLeftIcon = ChevronLeft
export const ChevronRightIcon = ChevronRight

// Contact Icons
export const PhoneIcon = Phone
export const MailIcon = Mail
export const MapPinIcon = MapPin

// Utility Icons
export const ClockIcon = Clock
export const ShareIcon = Share
export const FilterIcon = Filter
export const SortIcon = Sort
export const MenuIcon = Menu
export const BellIcon = Bell
export const HelpCircleIcon = HelpCircle
export const ExternalLinkIcon = ExternalLink

// Default export for convenience
export const Icons = {
  user: UserIcon,
  users: UsersIcon,
  home: HomeIcon,
  calendar: CalendarIcon,
  fileText: FileTextIcon,
  barChart3: BarChart3Icon,
  creditCard: CreditCardIcon,
  settings: SettingsIcon,
  logOut: LogOutIcon,
  eye: EyeIcon,
  eyeOff: EyeOffIcon,
  check: CheckIcon,
  x: XIcon,
  alertCircle: AlertCircleIcon,
  info: InfoIcon,
  chevronDown: ChevronDownIcon,
  chevronUp: ChevronUpIcon,
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  search: SearchIcon,
  plus: PlusIcon,
  minus: MinusIcon,
  edit: EditIcon,
  trash: Trash2Icon,
  download: DownloadIcon,
  upload: UploadIcon,
  save: SaveIcon,
  phone: PhoneIcon,
  mail: MailIcon,
  mapPin: MapPinIcon,
  clock: ClockIcon,
  star: StarIcon,
  heart: HeartIcon,
  thumbsUp: ThumbsUpIcon,
  share: ShareIcon,
  filter: FilterIcon,
  sort: SortIcon,
  menu: MenuIcon,
  bell: BellIcon,
  helpCircle: HelpCircleIcon,
  externalLink: ExternalLinkIcon,
}
