"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Progress,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Separator,
  Switch,
  Label,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@neonpro/ui"

import {
  AlertCircle,
  Activity,
  BarChart3,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Filter,
  Globe,
  Heart,
  Home,
  LineChart,
  MapPin,
  Menu,
  MoreHorizontal,
  Phone,
  PieChart,
  Search,
  Settings,
  Shield,
  Star,
  Target,
  TrendingUp,
  Users,
  Zap,
  Eye,
  Download,
  Upload,
  Edit,
  Trash2,
  Plus,
  Minus,
  X,
  Check,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Bell,
  Mail,
  MessageSquare,
  Video,
  Mic,
  Camera,
  Image,
  Paperclip,
  Send,
  ThumbsUp,
  ThumbsDown,
  Share,
  Bookmark,
  Flag,
  MoreVertical,
  ExternalLink,
  Copy,
  Link,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Lock,
  Unlock,
  Key,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,
  Crown,
  Briefcase,
  GraduationCap,
  Building,
  Car,
  Plane,
  Ship,
  Train,
  Bike,
  MapPinned,
  Route,
  Navigation,
  Compass,
  Map,
  Layers,
  Package,
  ShoppingCart,
  CreditCard as CreditCardIcon,
  Banknote,
  Coins,
  Receipt,
  Calculator,
  TrendingDown,
  BarChart,
  BarChart2,
  AreaChart,
  PieChart as PieChartIcon,
  ScatterChart,
  Database,
  Server,
  Cloud,
  CloudUpload,
  CloudDownload,
  Wifi,
  WifiOff,
  Bluetooth,
  Cpu,
  HardDrive,
  Memory,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Desktop,
  Headphones,
  Speaker,
  Microphone,
  Webcam,
  Printer,
  Scanner,
  Keyboard,
  Mouse,
  Gamepad2,
  Joystick,
  Camera as CameraIcon,
  Video as VideoIcon,
  Film,
  Music,
  Radio,
  Tv,
  Youtube,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Github,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Code,
  Code2,
  Terminal,
  FileCode,
  FileText as FileTextIcon,
  File,
  Folder,
  FolderOpen,
  Archive,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Share2,
  Link2,
  Paperclip as PaperclipIcon,
  Pin,
  Tag,
  Tags,
  Bookmark as BookmarkIcon,
  Star as StarIcon,
  Heart as HeartIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  MessageCircle,
  MessageSquare as MessageSquareIcon,
  Mail as MailIcon,
  Send as SendIcon,
  Inbox,
  Outbox,
  Drafts,
  Trash,
  Archive as ArchiveIcon,
  Spam,
  Important,
  Label,
  MarkAsUnread,
  Reply,
  ReplyAll,
  Forward,
  Undo,
  Redo,
  Cut,
  Copy as CopyIcon,
  Paste,
  Scissors,
  PaintBucket,
  Palette,
  Brush,
  Pen,
  PenTool,
  Edit2,
  Edit3,
  Type,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Indent,
  Outdent,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Subscript,
  Superscript,
  WrapText,
  ColumnSpacing,
  RowSpacing,
  Table as TableIcon,
  Grid,
  Layout,
  LayoutGrid,
  LayoutList,
  Sidebar,
  SidebarOpen,
  SidebarClose,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Split,
  Combine,
  Group,
  Ungroup,
  FlipHorizontal,
  FlipVertical,
  RotateCw,
  RotateCcw,
  Move,
  Resize,
  Crop,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Rectangle,
  RoundedRect,
  Ellipse,
  Polygon,
  Bezier,
  Spline,
  Vector,
  Anchor,
  Crosshair,
  Focus,
  ScanLine,
  QrCode,
  Barcode,
  Fingerprint,
  FaceId,
  Scan,
  Search as SearchIcon,
  Filter as FilterIcon,
  Sort,
  SortAsc,
  SortDesc,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  ArrowUpDown,
  ArrowLeftRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  CornerDownLeft,
  CornerDownRight,
  CornerUpLeft,
  CornerUpRight,
  CornerLeftDown,
  CornerLeftUp,
  CornerRightDown,
  CornerRightUp,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat,
  Activity as ActivityIcon,
  Pulse,
  Waves,
  Zap as ZapIcon,
  Flame,
  Droplet,
  Snowflake,
  Sun,
  Moon,
  Stars,
  Cloud as CloudIcon,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Rainbow,
  Sunrise,
  Sunset,
  Thermometer,
  Gauge,
  Wind,
  Eye as EyeIcon,
  EyeOff,
  Glasses,
  Telescope,
  Microscope,
  Lightbulb,
  Flashlight,
  Candle,
  Lamp,
  LampCeiling,
  LampDesk,
  LampFloor,
  LampWall,
  Power,
  PowerOff,
  Plug,
  Plug2,
  Cable,
  Usb,
  Ethernet,
  Hdmi,
  Bluetooth as BluetoothIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Antenna,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  Radio as RadioIcon,
  Radar,
  Satellite,
  Tower,
  Broadcast,
  Cast,
  Airplay,
  Chromecast,
  Rss,
  Podcast,
  Megaphone,
  Volume,
  Volume1,
  Volume2 as Volume2Icon,
  VolumeX as VolumeXIcon,
  Mute,
  Unmute,
  Play as PlayIcon,
  Pause as PauseIcon,
  Stop,
  type Record,
  FastForward,
  Rewind,
  SkipBack as SkipBackIcon,
  SkipForward as SkipForwardIcon,
  Repeat as RepeatIcon,
  Repeat1,
  Shuffle as ShuffleIcon,
  Music as MusicIcon,
  Music2,
  Music3,
  Music4,
  Disc,
  Disc2,
  Disc3,
  Cassette,
  Vinyl,
  Radio2,
  Headphones as HeadphonesIcon,
  Speaker as SpeakerIcon,
  Speakers,
  Soundwave,
  AudioLines,
  Mic as MicIcon,
  Mic2,
  MicOff,
  Microphone as MicrophoneIcon,
  Camera as CameraIcon2,
  Camera2,
  CameraOff,
  Video as VideoIcon2,
  Video2,
  VideoOff,
  Film as FilmIcon,
  Clapperboard,
  Theater,
  Projector,
  Tv as TvIcon,
  Monitor as MonitorIcon,
  MonitorOff,
  MonitorPlay,
  MonitorPause,
  MonitorStop,
  MonitorX,
  MonitorCheck,
  MonitorDown,
  MonitorUp,
  Smartphone as SmartphoneIcon,
  SmartphoneCharging,
  SmartphoneNfc,
  Tablet as TabletIcon,
  TabletSmartphone,
  Laptop as LaptopIcon,
  Laptop2,
  LaptopMinimal,
  Desktop as DesktopIcon,
  PcCase,
  HardDrive as HardDriveIcon,
  HardDriveDownload,
  HardDriveUpload,
  SSD,
  Database as DatabaseIcon,
  DatabaseBackup,
  DatabaseZap,
  Server as ServerIcon,
  ServerCog,
  ServerCrash,
  ServerOff,
  Cloud as CloudIcon2,
  CloudCog,
  CloudOff,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  CloudCheck,
  CloudX,
  CloudAlert,
  Download as DownloadIcon2,
  Upload as UploadIcon2,
  Import,
  Export,
  Inbox as InboxIcon,
  Outbox as OutboxIcon,
  Package as PackageIcon,
  Package2,
  PackageCheck,
  PackageX,
  PackageOpen,
  PackageSearch,
  PackagePlus,
  PackageMinus,
  Box,
  Boxes,
  Container,
  Archive as ArchiveIcon2,
  ArchiveRestore,
  ArchiveX,
  FolderArchive,
  FileArchive,
  Zip,
  Unzip,
  ShoppingCart as ShoppingCartIcon,
  ShoppingBag,
  Store,
  Storefront,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon2,
  Banknote as BanknoteIcon,
  Coins as CoinsIcon,
  DollarSign as DollarSignIcon,
  Euro,
  Pound,
  Yen,
  Bitcoin,
  Wallet,
  PiggyBank,
  Landmark,
  Building2,
  Home as HomeIcon,
  Hotel,
  School,
  Hospital,
  Church,
  Factory,
  Warehouse,
  Construction,
  Crane,
  Hammer,
  Wrench,
  Screwdriver,
  Drill,
  Saw,
  Ruler,
  Triangle as TriangleIcon,
  Square as SquareIcon,
  Circle as CircleIcon,
  Pentagon,
  Hexagon as HexagonIcon,
  Octagon as OctagonIcon,
  Star as StarIcon2,
  Diamond,
  Heart as HeartIcon2,
  Spade,
  Club,
  Gem,
  Crown as CrownIcon,
  Award,
  Trophy,
  Medal,
  Gift,
  Cake,
  PartyPopper,
  Balloon,
  Confetti,
  Fireworks,
  Sparkles,
  Sparkle,
  Shine,
  Glitter,
  Magic,
  Wand,
  Crystal,
  Feather,
  Leaf,
  Tree,
  TreePine,
  Flower,
  Rose,
  Tulip,
  Cherry,
  Apple,
  Grape,
  Lemon,
  Orange,
  Strawberry,
  Banana,
  Carrot,
  Pepper,
  Corn,
  Wheat,
  Rice,
  Bread,
  Croissant,
  Pizza,
  Burger,
  Sandwich,
  Taco,
  Soup,
  Salad,
  Coffee,
  Tea,
  Beer,
  Wine,
  Cocktail,
  Juice,
  Milk,
  Water,
  IceCream,
  Cookie,
  Donut,
  Candy,
  Chocolate,
  Cake as CakeIcon,
  Pie,
  Cupcake,
  Lollipop,
  Pretzel,
  Popcorn,
  Nut,
  Egg,
  Bacon,
  Sausage,
  Ham,
  Steak,
  Chicken,
  Fish,
  Shrimp,
  Lobster,
  Crab,
  Octopus,
  Squid,
  Whale,
  Dolphin,
  Shark,
  Fish2,
  Turtle,
  Frog,
  Lizard,
  Snake,
  Crocodile,
  Tiger,
  Lion,
  Leopard,
  Elephant,
  Rhino,
  Hippo,
  Horse,
  Unicorn,
  Zebra,
  Deer,
  Rabbit,
  Squirrel,
  Hedgehog,
  Bat,
  Bear,
  Panda,
  Koala,
  Monkey,
  Gorilla,
  Sloth,
  Kangaroo,
  Penguin,
  Eagle,
  Owl,
  Parrot,
  Flamingo,
  Swan,
  Duck,
  Chicken as ChickenIcon,
  Rooster,
  Turkey,
  Peacock,
  Dove,
  Crow,
  Robin,
  Sparrow,
  Hummingbird,
  Butterfly,
  Bee,
  Beetle,
  Spider,
  Ant,
  Ladybug,
  Dragonfly,
  Mosquito,
  Fly,
  Worm,
  Snail,
  Shell,
  Coral,
  Seaweed,
  Mushroom,
  Cactus,
  Evergreen,
  Deciduous,
  Palm,
  Bamboo,
  Clover,
  Shamrock,
  FourLeafClover,
  Herb,
  Seedling,
  Sprout,
  Blossom,
  Hibiscus,
  Sunflower,
  Daisy,
  Lily,
  Iris,
  Orchid,
  Peony,
  Jasmine,
  Lavender,
  Sage,
  Basil,
  Mint,
  Thyme,
  Rosemary,
  Parsley,
  Cilantro,
  Dill,
  Oregano,
  Pepper as PepperIcon,
  Salt,
  Sugar,
  Honey,
  Butter,
  Cheese,
  Yogurt,
  Cream,
  Flour,
  Oil,
  Vinegar,
  Sauce,
  Ketchup,
  Mustard,
  Mayo,
  Pickle,
  Olive,
  Garlic,
  Onion,
  Ginger,
  Chili,
  Paprika,
  Cinnamon,
  Vanilla,
  Chocolate as ChocolateIcon,
  Caramel,
  Maple,
  Syrup,
  Jam,
  Jelly,
  Peanut,
  Almond,
  Walnut,
  Pecan,
  Cashew,
  Pistachio,
  Hazelnut,
  Coconut,
  Avocado,
  Tomato,
  Potato,
  Carrot as CarrotIcon,
  Broccoli,
  Cauliflower,
  Cabbage,
  Lettuce,
  Spinach,
  Kale,
  Arugula,
  Watercress,
  Celery,
  Cucumber,
  Zucchini,
  Eggplant,
  Radish,
  Turnip,
  Beet,
  Parsnip,
  Artichoke,
  Asparagus,
  Brussels,
  Peas,
  Beans,
  Lentils,
  Chickpeas,
  Quinoa,
  Barley,
  Oats,
  Buckwheat,
  Millet,
  Amaranth,
  Chia,
  Flax,
  Sesame,
  Poppy,
  Sunflower as SunflowerIcon,
  Pumpkin,
  Watermelon,
  Cantaloupe,
  Honeydew,
  Papaya,
  Mango,
  Pineapple,
  Kiwi,
  Passionfruit,
  Dragonfruit,
  Starfruit,
  Fig,
  Date,
  Raisin,
  Prune,
  Apricot,
  Peach,
  Plum,
  Nectarine,
  Cherry as CherryIcon,
  Grape as GrapeIcon,
  Blueberry,
  Blackberry,
  Raspberry,
  Strawberry as StrawberryIcon,
  Cranberry,
  Goji,
  Acai,
  Pomegranate,
  Persimmon,
  Guava,
  Lychee,
  Rambutan,
  Jackfruit,
  Durian,
  Coconut as CoconutIcon,
  Lime,
  Grapefruit,
  Tangerine,
  Clementine,
  Mandarin,
  Orange as OrangeIcon,
  Lemon as LemonIcon,
  Yuzu,
  Bergamot,
  Key,
  Finger,
  Kumquat,
  Blood,
  Navel,
  Valencia,
  Jaffa,
  Seville,
  Meyer,
  Eureka,
  Lisbon,
  Persian,
  Tahiti,
  Bearss,
  Mexican,
  Key as KeyIcon,
  West,
  Indian,
  Kaffir,
  Makrut,
  Buddha,
  Hand,
  Citron,
  Etrog,
  Sudachi,
  Kabosu,
  Dekopon,
  Hassaku,
  Iyokan,
  Jabara,
  Kawachi,
  Banpeiyu,
  Amanatsu,
  Hyuganatsu,
  Zabon,
  Buntan,
  Pomelo,
  Sweetie,
  Oroblanco,
  Melogold,
  Cocktail as CocktailIcon,
  Ugli,
  Minneola,
  Ortanique,
  Tangelo,
  Honeybell,
  Temple,
  Murcott,
  Page,
  Lee,
  Nova,
  Osceola,
  Robinson,
  Sunburst,
  Wekiwa,
  Fairchild,
  Fortune,
  Fremont,
  Gold,
  Nugget,
  Pixie,
  Tango,
  Encore,
  Shasta,
  Yosemite,
  Tahoe,
  W,
  Murcott as MurcottIcon,
  Afourer,
  Nadorcott,
  Oronules,
  Clemenvilla,
  Ellendale,
  Emperor,
  Fortune as FortuneIcon,
  Fremont as FremontIcon,
  Gold as GoldIcon,
  Honey,
  Imperial,
  Kara,
  Kinnow,
  Lee as LeeIcon,
  Mediterranean,
  Minneola as MinneolaIcon,
  Murcott as MurcottIcon2,
  Nova as NovaIcon,
  Ortanique as OrtaniqueIcon,
  Page as PageIcon,
  Pixie as PixieIcon,
  Ponkan,
  Robinson as RobinsonIcon,
  Satsuma,
  Sunburst as SunburstIcon,
  Tango as TangoIcon,
  Temple as TempleIcon,
  Wilking,
  W as WIcon,
  Murcott as MurcottIcon3,
} from "lucide-react"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface BMadDashboardProps {
  userId: string
  tenantId: string
}

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  department: string
  status: "online" | "offline" | "away"
  lastSeen: Date
}

interface Activity {
  id: string
  user: User
  action: string
  target: string
  timestamp: Date
  metadata?: Record<string, any>
}

interface Metric {
  id: string
  label: string
  value: number
  previousValue: number
  change: number
  trend: "up" | "down" | "stable"
  format: "number" | "percentage" | "currency"
  icon: React.ComponentType<any>
}

interface Task {
  id: string
  title: string
  description: string
  status: "pending" | "in-progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  assignee: User
  dueDate: Date
  tags: string[]
  progress: number
}

interface Project {
  id: string
  name: string
  description: string
  status: "planning" | "active" | "on-hold" | "completed"
  progress: number
  startDate: Date
  endDate: Date
  team: User[]
  budget: number
  spent: number
  tasks: Task[]
}

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
  read: boolean
  action?: {
    label: string
    url: string
  }
}

const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@empresa.com",
    avatar: "/avatars/joao.jpg",
    role: "Desenvolvedor",
    department: "Tecnologia",
    status: "online",
    lastSeen: new Date()
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@empresa.com", 
    avatar: "/avatars/maria.jpg",
    role: "Designer",
    department: "Design",
    status: "away",
    lastSeen: new Date(Date.now() - 1000 * 60 * 30)
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro@empresa.com",
    role: "Gerente",
    department: "Gestão",
    status: "offline",
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2)
  }
]

const MOCK_METRICS: Metric[] = [
  {
    id: "revenue",
    label: "Receita Mensal",
    value: 125000,
    previousValue: 115000,
    change: 8.7,
    trend: "up",
    format: "currency",
    icon: DollarSign
  },
  {
    id: "users",
    label: "Usuários Ativos",
    value: 2840,
    previousValue: 2650,
    change: 7.2,
    trend: "up",
    format: "number",
    icon: Users
  },
  {
    id: "conversion",
    label: "Taxa de Conversão",
    value: 3.2,
    previousValue: 2.8,
    change: 14.3,
    trend: "up",
    format: "percentage",
    icon: Target
  },
  {
    id: "satisfaction",
    label: "Satisfação do Cliente",
    value: 4.8,
    previousValue: 4.6,
    change: 4.3,
    trend: "up",
    format: "number",
    icon: Star
  }
]

export default function BMadMasterDashboard({ userId, tenantId }: BMadDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState("overview")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Simular carregamento de dados
    const loadData = async () => {
      setLoading(true)
      // Aqui faria chamadas para APIs reais
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLoading(false)
    }
    
    loadData()
  }, [userId, tenantId])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const getMetricIcon = (metric: Metric) => {
    const Icon = metric.icon
    return <Icon className="h-4 w-4" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      "online": "bg-green-100 text-green-800",
      "offline": "bg-gray-100 text-gray-800", 
      "away": "bg-yellow-100 text-yellow-800",
      "pending": "bg-blue-100 text-blue-800",
      "in-progress": "bg-orange-100 text-orange-800",
      "completed": "bg-green-100 text-green-800",
      "cancelled": "bg-red-100 text-red-800",
      "low": "bg-gray-100 text-gray-800",
      "medium": "bg-blue-100 text-blue-800",
      "high": "bg-orange-100 text-orange-800",
      "urgent": "bg-red-100 text-red-800"
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-sm text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
            
            <Avatar>
              <AvatarImage src="/avatars/user.jpg" />
              <AvatarFallback>US</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-64 bg-white shadow-lg min-h-screen"
            >
              <nav className="p-6">
                <div className="space-y-2">
                  <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("overview")}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Visão Geral
                  </Button>
                  <Button
                    variant={activeTab === "analytics" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("analytics")}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                  <Button
                    variant={activeTab === "projects" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("projects")}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Projetos
                  </Button>
                  <Button
                    variant={activeTab === "tasks" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("tasks")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Tarefas
                  </Button>
                  <Button
                    variant={activeTab === "team" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("team")}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Equipe
                  </Button>
                  <Button
                    variant={activeTab === "settings" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Button>
                </div>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {MOCK_METRICS.map((metric) => (
                  <Card key={metric.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {metric.label}
                      </CardTitle>
                      {getMetricIcon(metric)}
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {metric.format === "currency" && formatCurrency(metric.value)}
                        {metric.format === "percentage" && formatPercentage(metric.value)}
                        {metric.format === "number" && metric.value.toLocaleString()}
                      </div>
                      <p className={`text-xs ${getChangeColor(metric.change)}`}>
                        {metric.change > 0 ? "+" : ""}{metric.change.toFixed(1)}% desde o período anterior
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Receita por Período</CardTitle>
                    <CardDescription>
                      Comparação dos últimos 6 meses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center text-gray-400">
                      <BarChart3 className="h-12 w-12" />
                      <span className="ml-2">Gráfico de receita</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Usuários</CardTitle>
                    <CardDescription>
                      Por categoria de uso
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 flex items-center justify-center text-gray-400">
                      <PieChart className="h-12 w-12" />
                      <span className="ml-2">Gráfico de pizza</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Feed */}
              <Card>
                <CardHeader>
                  <CardTitle>Atividades Recentes</CardTitle>
                  <CardDescription>
                    Últimas ações dos usuários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            Usuário {i} executou uma ação importante
                          </p>
                          <p className="text-xs text-gray-500">
                            há {i} minuto{i > 1 ? "s" : ""}
                          </p>
                        </div>
                        <Badge variant="outline">Nova</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Analytics</h2>
                <div className="flex items-center space-x-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filtrar período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os períodos</SelectItem>
                      <SelectItem value="7d">Últimos 7 dias</SelectItem>
                      <SelectItem value="30d">Últimos 30 dias</SelectItem>
                      <SelectItem value="90d">Últimos 90 dias</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Tendências de Crescimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-96 flex items-center justify-center text-gray-400">
                      <LineChart className="h-16 w-16" />
                      <span className="ml-2">Gráfico de linha</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Metas do Mês</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: "Receita", current: 85, target: 100 },
                      { label: "Usuários", current: 92, target: 100 },
                      { label: "Satisfação", current: 78, target: 100 }
                    ].map((goal, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{goal.label}</span>
                          <span>{goal.current}%</span>
                        </div>
                        <Progress value={goal.current} className="h-2" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Projetos</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Projeto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Projeto</DialogTitle>
                      <DialogDescription>
                        Preencha as informações do projeto
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="project-name">Nome do Projeto</Label>
                        <Input id="project-name" placeholder="Digite o nome" />
                      </div>
                      <div>
                        <Label htmlFor="project-desc">Descrição</Label>
                        <Textarea id="project-desc" placeholder="Descreva o projeto" />
                      </div>
                      <div className="flex space-x-4">
                        <div className="flex-1">
                          <Label htmlFor="start-date">Data de Início</Label>
                          <Input id="start-date" type="date" />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor="end-date">Data de Término</Label>
                          <Input id="end-date" type="date" />
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline">Cancelar</Button>
                        <Button>Criar Projeto</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Projeto {i}</CardTitle>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardDescription>
                        Descrição do projeto {i}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progresso</span>
                            <span>{Math.floor(Math.random() * 100)}%</span>
                          </div>
                          <Progress value={Math.floor(Math.random() * 100)} />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex -space-x-2">
                            {[1, 2, 3].map((j) => (
                              <Avatar key={j} className="h-6 w-6 border-2 border-white">
                                <AvatarFallback className="text-xs">U{j}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          {getStatusBadge(["planning", "active", "on-hold", "completed"][Math.floor(Math.random() * 4)])}
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          Entrega: {format(new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Tarefas</h2>
                <div className="flex items-center space-x-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filtrar status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="in-progress">Em andamento</SelectItem>
                      <SelectItem value="completed">Concluídas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Tarefa
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Tarefas</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarefa</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead>Prazo</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div>
                              <p className="font-medium">Tarefa {i}</p>
                              <p className="text-sm text-gray-500">Descrição da tarefa {i}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">U{i}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm">Usuário {i}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(["pending", "in-progress", "completed"][Math.floor(Math.random() * 3)])}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(["low", "medium", "high", "urgent"][Math.floor(Math.random() * 4)])}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000), "dd/MM", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Team Tab */}
            <TabsContent value="team" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">Equipe</h2>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Convidar Membro
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_USERS.map((user) => (
                  <Card key={user.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{user.name}</CardTitle>
                          <CardDescription>{user.role}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Status</span>
                          {getStatusBadge(user.status)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Departamento</span>
                          <span className="text-sm">{user.department}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Último acesso</span>
                          <span className="text-sm">
                            {format(user.lastSeen, "dd/MM HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Mail className="h-4 w-4 mr-1" />
                            Email
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <h2 className="text-3xl font-bold">Configurações</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferências Gerais</CardTitle>
                    <CardDescription>
                      Configure suas preferências do sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="notifications">Notificações</Label>
                        <p className="text-sm text-gray-500">Receber notificações em tempo real</p>
                      </div>
                      <Switch id="notifications" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dark-mode">Modo Escuro</Label>
                        <p className="text-sm text-gray-500">Usar tema escuro</p>
                      </div>
                      <Switch id="dark-mode" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-save">Salvamento Automático</Label>
                        <p className="text-sm text-gray-500">Salvar alterações automaticamente</p>
                      </div>
                      <Switch id="auto-save" defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Configurações de Segurança</CardTitle>
                    <CardDescription>
                      Gerencie suas configurações de segurança
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="2fa">Autenticação em Duas Etapas</Label>
                        <p className="text-sm text-gray-500">Adicionar camada extra de segurança</p>
                      </div>
                      <Switch id="2fa" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="session-timeout">Timeout de Sessão</Label>
                        <p className="text-sm text-gray-500">Deslogar automaticamente após inatividade</p>
                      </div>
                      <Switch id="session-timeout" defaultChecked />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="password-change">Alterar Senha</Label>
                      <Button variant="outline" size="sm">
                        <Key className="h-4 w-4 mr-2" />
                        Alterar Senha
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}