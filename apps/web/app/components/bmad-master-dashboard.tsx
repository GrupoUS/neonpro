'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription,
  AlertTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  Calendar,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Switch,
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
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@neonpro/ui';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AnimatePresence, motion } from 'framer-motion';

import {
  Acai,
  Activity,
  Activity as ActivityIcon,
  Airplay,
  AlertCircle,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Almond,
  Amaranth,
  Anchor,
  Ant,
  Antenna,
  Apple,
  Apricot,
  Archive,
  Archive as ArchiveIcon,
  Archive as ArchiveIcon2,
  ArchiveRestore,
  ArchiveX,
  AreaChart,
  ArrowDown,
  ArrowLeft,
  ArrowLeft as ArrowLeftIcon,
  ArrowLeftRight,
  ArrowRight,
  ArrowRight as ArrowRightIcon,
  ArrowUp,
  ArrowUpDown,
  Artichoke,
  Arugula,
  Asparagus,
  AudioLines,
  Avocado,
  Award,
  Bacon,
  Balloon,
  Bamboo,
  Banana,
  Banknote,
  Banknote as BanknoteIcon,
  BarChart,
  BarChart2,
  BarChart3,
  Barcode,
  Barley,
  Basil,
  Bat,
  Beans,
  Bear,
  Bee,
  Beer,
  Beet,
  Beetle,
  Bell,
  Bergamot,
  Bezier,
  Bike,
  Bitcoin,
  Blackberry,
  Blossom,
  Blueberry,
  Bluetooth,
  Bluetooth as BluetoothIcon,
  Bold,
  Bookmark,
  Bookmark as BookmarkIcon,
  Box,
  Boxes,
  Bread,
  Briefcase,
  Broadcast,
  Broccoli,
  Brush,
  Brussels,
  Buckwheat,
  Building,
  Building2,
  Burger,
  Butter,
  Butterfly,
  Cabbage,
  Cable,
  Cactus,
  Cake,
  Cake as CakeIcon,
  Calculator,
  Calendar as CalendarIcon,
  Camera,
  Camera2,
  Camera as CameraIcon,
  Camera as CameraIcon2,
  CameraOff,
  Candle,
  Candy,
  Cantaloupe,
  Car,
  Caramel,
  Carrot,
  Carrot as CarrotIcon,
  Cashew,
  Cassette,
  Cast,
  Cauliflower,
  Celery,
  Check,
  Cheese,
  Cherry,
  Cherry as CherryIcon,
  ChevronDown,
  ChevronDown as ChevronDownIcon,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ChevronRightIcon,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  ChevronUp,
  Chia,
  Chicken,
  Chicken as ChickenIcon,
  Chickpeas,
  Chili,
  Chocolate,
  Chocolate as ChocolateIcon,
  Chromecast,
  Church,
  Cilantro,
  Cinnamon,
  Circle,
  Circle as CircleIcon,
  Clapperboard,
  Clementine,
  Clock,
  Cloud,
  CloudAlert,
  CloudCheck,
  CloudCog,
  CloudDownload,
  CloudDownload as CloudDownloadIcon,
  CloudDrizzle,
  Cloud as CloudIcon,
  Cloud as CloudIcon2,
  CloudLightning,
  CloudOff,
  CloudRain,
  CloudSnow,
  CloudUpload,
  CloudUpload as CloudUploadIcon,
  CloudX,
  Clover,
  Club,
  Cocktail,
  Coconut,
  Coconut as CoconutIcon,
  Code,
  Code2,
  Coffee,
  Coins,
  Coins as CoinsIcon,
  ColumnSpacing,
  Combine,
  Compass,
  Confetti,
  Construction,
  Container,
  Cookie,
  Copy,
  Copy as CopyIcon,
  Coral,
  Corn,
  CornerDownLeft,
  CornerDownRight,
  CornerLeftDown,
  CornerLeftUp,
  CornerRightDown,
  CornerRightUp,
  CornerUpLeft,
  CornerUpRight,
  Cpu,
  Crab,
  Cranberry,
  Crane,
  Cream,
  CreditCard,
  CreditCard as CreditCardIcon,
  CreditCard as CreditCardIcon2,
  Crocodile,
  Croissant,
  Crop,
  Crosshair,
  Crow,
  Crown,
  Crown as CrownIcon,
  Crystal,
  Cucumber,
  Cupcake,
  Cut,
  Daisy,
  Database,
  DatabaseBackup,
  Database as DatabaseIcon,
  DatabaseZap,
  Date,
  Deciduous,
  Deer,
  Desktop,
  Desktop as DesktopIcon,
  Diamond,
  Dill,
  Disc,
  Disc2,
  Disc3,
  DollarSign,
  DollarSign as DollarSignIcon,
  Dolphin,
  Donut,
  Dove,
  Download,
  Download as DownloadIcon,
  Download as DownloadIcon2,
  Drafts,
  Dragonfly,
  Dragonfruit,
  Drill,
  Droplet,
  Duck,
  Durian,
  Eagle,
  Edit,
  Edit2,
  Edit3,
  Egg,
  Eggplant,
  Elephant,
  Ellipse,
  Ethernet,
  Euro,
  Evergreen,
  Export,
  ExternalLink,
  Eye,
  Eye as EyeIcon,
  EyeOff,
  Facebook,
  FaceId,
  Factory,
  FastForward,
  Feather,
  Fig,
  File,
  FileArchive,
  FileCode,
  FileText,
  FileText as FileTextIcon,
  Film,
  Film as FilmIcon,
  Filter,
  Filter as FilterIcon,
  Fingerprint,
  Fireworks,
  Fish,
  Fish2,
  Flag,
  Flame,
  Flamingo,
  Flashlight,
  Flax,
  FlipHorizontal,
  FlipVertical,
  Flour,
  Flower,
  Fly,
  Focus,
  Folder,
  FolderArchive,
  FolderOpen,
  Forward,
  FourLeafClover,
  Frog,
  Gamepad2,
  Garlic,
  Gauge,
  Gem,
  Gift,
  Ginger,
  GitBranch,
  GitCommit,
  Github,
  GitMerge,
  GitPullRequest,
  Glasses,
  Glitter,
  Globe,
  Goji,
  Gorilla,
  GraduationCap,
  Grape,
  Grapefruit,
  Grape as GrapeIcon,
  Grid,
  Group,
  Guava,
  Ham,
  Hammer,
  HardDrive,
  HardDriveDownload,
  HardDrive as HardDriveIcon,
  HardDriveUpload,
  Hazelnut,
  Hdmi,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Headphones,
  Headphones as HeadphonesIcon,
  Heart,
  Heart as HeartIcon,
  Heart as HeartIcon2,
  Hedgehog,
  Herb,
  Hexagon,
  Hexagon as HexagonIcon,
  Hibiscus,
  Hippo,
  Home,
  Home as HomeIcon,
  Honey,
  Honeydew,
  Horse,
  Hospital,
  Hotel,
  Hummingbird,
  IceCream,
  Image,
  Import,
  Important,
  Inbox,
  Inbox as InboxIcon,
  Indent,
  Instagram,
  Iris,
  Italic,
  Jackfruit,
  Jam,
  Jasmine,
  Jelly,
  Joystick,
  Juice,
  Kale,
  Kangaroo,
  Ketchup,
  Key,
  Keyboard,
  Kiwi,
  Koala,
  Label,
  Ladybug,
  Lamp,
  LampCeiling,
  LampDesk,
  LampFloor,
  LampWall,
  Landmark,
  Laptop,
  Laptop2,
  Laptop as LaptopIcon,
  LaptopMinimal,
  Lavender,
  Layers,
  Layout,
  LayoutGrid,
  LayoutList,
  Leaf,
  Lemon,
  Lemon as LemonIcon,
  Lentils,
  Leopard,
  Lettuce,
  Lightbulb,
  Lily,
  Lime,
  LineChart,
  Link,
  Link2,
  Linkedin,
  Lion,
  List,
  ListOrdered,
  Lizard,
  Lobster,
  Lock,
  Lollipop,
  Lychee,
  Magic,
  Mail,
  Mail as MailIcon,
  Mandarin,
  Mango,
  Map,
  Maple,
  MapPin,
  MapPinned,
  MarkAsUnread,
  Maximize2,
  Mayo,
  Medal,
  Megaphone,
  Memory,
  Menu,
  MessageCircle,
  MessageSquare,
  MessageSquare as MessageSquareIcon,
  Mic,
  Mic2,
  Mic as MicIcon,
  MicOff,
  Microphone,
  Microphone as MicrophoneIcon,
  Microscope,
  Milk,
  Millet,
  Minimize2,
  Mint,
  Minus,
  Monitor,
  MonitorCheck,
  MonitorDown,
  Monitor as MonitorIcon,
  MonitorOff,
  MonitorPause,
  MonitorPlay,
  MonitorStop,
  MonitorUp,
  MonitorX,
  Monkey,
  Moon,
  MoreHorizontal,
  MoreVertical,
  Mosquito,
  Mouse,
  Move,
  Mushroom,
  Music,
  Music2,
  Music3,
  Music4,
  Music as MusicIcon,
  Mustard,
  Mute,
  Navigation,
  Nectarine,
  Nut,
  Oats,
  Octagon,
  Octagon as OctagonIcon,
  Octopus,
  Oil,
  Olive,
  Onion,
  Orange,
  Orange as OrangeIcon,
  Orchid,
  Oregano,
  Outbox,
  Outbox as OutboxIcon,
  Outdent,
  Owl,
  Package,
  Package2,
  PackageCheck,
  Package as PackageIcon,
  PackageMinus,
  PackageOpen,
  PackagePlus,
  PackageSearch,
  PackageX,
  PaintBucket,
  Palette,
  Palm,
  Panda,
  PanelBottom,
  PanelLeft,
  PanelRight,
  PanelTop,
  Papaya,
  Paperclip,
  Paperclip as PaperclipIcon,
  Paprika,
  Parrot,
  Parsley,
  Parsnip,
  PartyPopper,
  Passionfruit,
  Paste,
  Pause,
  Pause as PauseIcon,
  PcCase,
  Peach,
  Peacock,
  Peanut,
  Peas,
  Pecan,
  Pen,
  Penguin,
  PenTool,
  Pentagon,
  Peony,
  Pepper,
  Pepper as PepperIcon,
  Persimmon,
  Phone,
  Pickle,
  Pie,
  PieChart,
  PieChart as PieChartIcon,
  PiggyBank,
  Pin,
  Pineapple,
  Pistachio,
  Pizza,
  Plane,
  Play,
  Play as PlayIcon,
  Plug,
  Plug2,
  Plum,
  Plus,
  Podcast,
  Polygon,
  Pomegranate,
  Popcorn,
  Poppy,
  Potato,
  Pound,
  Power,
  PowerOff,
  Pretzel,
  Printer,
  Projector,
  Prune,
  Pulse,
  Pumpkin,
  QrCode,
  Quinoa,
  Quote,
  Rabbit,
  Radar,
  Radio,
  Radio2,
  Radio as RadioIcon,
  Radish,
  Rainbow,
  Raisin,
  Rambutan,
  Raspberry,
  Receipt,
  Receipt as ReceiptIcon,
  type Record,
  Rectangle,
  Redo,
  RefreshCw,
  Repeat,
  Repeat1,
  Repeat as RepeatIcon,
  Reply,
  ReplyAll,
  Resize,
  Rewind,
  Rhino,
  Rice,
  Robin,
  Rooster,
  Rose,
  Rosemary,
  RotateCcw,
  RotateCw,
  RoundedRect,
  Route,
  RowSpacing,
  Rss,
  Ruler,
  Sage,
  Salad,
  Salt,
  Sandwich,
  Satellite,
  Sauce,
  Sausage,
  Saw,
  Scan,
  ScanLine,
  Scanner,
  ScatterChart,
  School,
  Scissors,
  Screwdriver,
  Search,
  Search as SearchIcon,
  Seaweed,
  Seedling,
  Send,
  Send as SendIcon,
  Server,
  ServerCog,
  ServerCrash,
  Server as ServerIcon,
  ServerOff,
  Sesame,
  Settings,
  Shamrock,
  Share,
  Share2,
  Shark,
  Shell,
  Shield,
  Shine,
  Ship,
  ShoppingBag,
  ShoppingCart,
  ShoppingCart as ShoppingCartIcon,
  Shrimp,
  Shuffle,
  Shuffle as ShuffleIcon,
  Sidebar,
  SidebarClose,
  SidebarOpen,
  Signal,
  SignalHigh,
  SignalLow,
  SignalMedium,
  SignalZero,
  SkipBack,
  SkipBack as SkipBackIcon,
  SkipForward,
  SkipForward as SkipForwardIcon,
  Sloth,
  Smartphone,
  SmartphoneCharging,
  Smartphone as SmartphoneIcon,
  SmartphoneNfc,
  Snail,
  Snake,
  Snowflake,
  Sort,
  SortAsc,
  SortDesc,
  Soundwave,
  Soup,
  Spade,
  Spam,
  Sparkle,
  Sparkles,
  Sparrow,
  Speaker,
  Speaker as SpeakerIcon,
  Speakers,
  Spider,
  Spinach,
  Spline,
  Split,
  Sprout,
  Square,
  Square as SquareIcon,
  Squid,
  Squirrel,
  SSD,
  Star,
  Starfruit,
  Star as StarIcon,
  Star as StarIcon2,
  Stars,
  Steak,
  Stop,
  Store,
  Storefront,
  Strawberry,
  Strawberry as StrawberryIcon,
  Strikethrough,
  Subscript,
  Sugar,
  Sun,
  Sunflower,
  Sunflower as SunflowerIcon,
  Sunrise,
  Sunset,
  Superscript,
  Swan,
  Syrup,
  Table as TableIcon,
  Tablet,
  Tablet as TabletIcon,
  TabletSmartphone,
  Taco,
  Tag,
  Tags,
  Tangerine,
  Target,
  Tea,
  Telescope,
  Terminal,
  Theater,
  Thermometer,
  ThumbsDown,
  ThumbsDown as ThumbsDownIcon,
  ThumbsUp,
  ThumbsUp as ThumbsUpIcon,
  Thyme,
  Tiger,
  Tomato,
  Tower,
  Train,
  Trash,
  Trash2,
  Tree,
  TreePine,
  TrendingDown,
  TrendingDown as TrendingDownIcon,
  TrendingFlat,
  TrendingUp,
  TrendingUp as TrendingUpIcon,
  Triangle,
  Triangle as TriangleIcon,
  Trophy,
  Tulip,
  Turkey,
  Turnip,
  Turtle,
  Tv,
  Tv as TvIcon,
  Twitter,
  Type,
  Underline,
  Undo,
  Ungroup,
  Unicorn,
  Unlock,
  Unmute,
  Unzip,
  Upload,
  Upload as UploadIcon,
  Upload as UploadIcon2,
  Usb,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  UserX,
  Vanilla,
  Vector,
  Video,
  Video2,
  Video as VideoIcon,
  Video as VideoIcon2,
  VideoOff,
  Vinegar,
  Vinyl,
  Volume,
  Volume1,
  Volume2,
  Volume2 as Volume2Icon,
  VolumeX,
  VolumeX as VolumeXIcon,
  Wallet,
  Walnut,
  Wand,
  Warehouse,
  Water,
  Watercress,
  Watermelon,
  Waves,
  Webcam,
  Whale,
  Wheat,
  Wifi,
  Wifi as WifiIcon,
  WifiOff,
  WifiOff as WifiOffIcon,
  Wind,
  Wine,
  Worm,
  WrapText,
  Wrench,
  X,
  Yen,
  Yogurt,
  Youtube,
  Yuzu,
  Zap,
  Zap as ZapIcon,
  Zebra,
  Zip,
  Zucchini,
  Key,
  Afourer,
  Amanatsu,
  Banpeiyu,
  Bearss,
  Blood,
  Buddha,
  Buntan,
  Citron,
  Clemenvilla,
  Cocktail as CocktailIcon,
  Dekopon,
  Ellendale,
  Emperor,
  Encore,
  Etrog,
  Eureka,
  Fairchild,
  Finger,
  Fortune,
  Fortune as FortuneIcon,
  Fremont,
  Fremont as FremontIcon,
  Gold,
  Gold as GoldIcon,
  Hand,
  Hassaku,
  Honeybell,
  Hyuganatsu,
  Indian,
  Iyokan,
  Jabara,
  Jaffa,
  Kabosu,
  Kaffir,
  Kawachi,
  Key as KeyIcon,
  Kumquat,
  Lee,
  Lisbon,
  Makrut,
  Melogold,
  Mexican,
  Meyer,
  Minneola,
  Murcott,
  Murcott as MurcottIcon,
  Nadorcott,
  Navel,
  Nova,
  Nugget,
  Oroblanco,
  Oronules,
  Ortanique,
  Osceola,
  Page,
  Persian,
  Pixie,
  Pomelo,
  Robinson,
  Seville,
  Shasta,
  Sudachi,
  Sunburst,
  Sweetie,
  Tahiti,
  Tahoe,
  Tangelo,
  Tango,
  Temple,
  Ugli,
  Valencia,
  W,
  Wekiwa,
  West,
  Yosemite,
  Zabon,
  Honey,
  Imperial,
  Kara,
  Kinnow,
  Lee as LeeIcon,
  Mediterranean,
  Minneola as MinneolaIcon,
  Murcott as MurcottIcon2,
  Murcott as MurcottIcon3,
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
  W as WIcon,
  Wilking,
} from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

// Constants for time calculations
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;
const HOURS_PER_DAY = 24;
const DEFAULT_TIMEOUT_MS = 1000;

interface BMadDashboardProps {
  userId: string;
  tenantId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: Date;
}

interface Activity {
  id: string;
  user: User;
  action: string;
  target: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface Metric {
  id: string;
  label: string;
  value: number;
  previousValue: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'percentage' | 'currency';
  icon: React.ComponentType<any>;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: User;
  dueDate: Date;
  tags: string[];
  progress: number;
}

type Project = {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed';
  progress: number;
  startDate: Date;
  endDate: Date;
  team: User[];
  budget: number;
  spent: number;
  tasks: Task[];
};

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
};

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@empresa.com',
    avatar: '/avatars/joao.jpg',
    role: 'Desenvolvedor',
    department: 'Tecnologia',
    status: 'online',
    lastSeen: new Date(),
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    avatar: '/avatars/maria.jpg',
    role: 'Designer',
    department: 'Design',
    status: 'away',
    lastSeen: new Date(
      Date.now() - MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * 30
    ),
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@empresa.com',
    role: 'Gerente',
    department: 'Gestão',
    status: 'offline',
    lastSeen: new Date(
      Date.now() -
        MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE * MINUTES_PER_HOUR * 2
    ),
  },
];

const MOCK_METRICS: Metric[] = [
  {
    id: 'revenue',
    label: 'Receita Mensal',
    value: 125_000,
    previousValue: 115_000,
    change: 8.7,
    trend: 'up',
    format: 'currency',
    icon: DollarSign,
  },
  {
    id: 'users',
    label: 'Usuários Ativos',
    value: 2840,
    previousValue: 2650,
    change: 7.2,
    trend: 'up',
    format: 'number',
    icon: Users,
  },
  {
    id: 'conversion',
    label: 'Taxa de Conversão',
    value: 3.2,
    previousValue: 2.8,
    change: 14.3,
    trend: 'up',
    format: 'percentage',
    icon: Target,
  },
  {
    id: 'satisfaction',
    label: 'Satisfação do Cliente',
    value: 4.8,
    previousValue: 4.6,
    change: 4.3,
    trend: 'up',
    format: 'number',
    icon: Star,
  },
];

export default function BMadMasterDashboard({
  userId,
  tenantId,
}: BMadDashboardProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Simular carregamento de dados
    const loadData = async () => {
      setLoading(true);
      // Aqui faria chamadas para APIs reais
      await new Promise((resolve) => setTimeout(resolve, DEFAULT_TIMEOUT_MS));
      setLoading(false);
    };

    loadData();
  }, [userId, tenantId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getMetricIcon = (metric: Metric) => {
    const Icon = metric.icon;
    return <Icon className="h-4 w-4" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) {
      return 'text-green-600';
    }
    if (change < 0) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      online: 'bg-green-100 text-green-800',
      offline: 'bg-gray-100 text-gray-800',
      away: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };

    return (
      <Badge
        className={
          variants[status as keyof typeof variants] ||
          'bg-gray-100 text-gray-800'
        }
      >
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-blue-600 border-b-2" />
          <p className="text-gray-600 text-sm">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              size="sm"
              variant="ghost"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-bold text-2xl text-gray-900">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
              <Input
                className="w-64 pl-10"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                value={searchQuery}
              />
            </div>

            <Button size="sm" variant="ghost">
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
              animate={{ x: 0, opacity: 1 }}
              className="min-h-screen w-64 bg-white shadow-lg"
              exit={{ x: -300, opacity: 0 }}
              initial={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <nav className="p-6">
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    onClick={() => setActiveTab('overview')}
                    variant={activeTab === 'overview' ? 'default' : 'ghost'}
                  >
                    <Home className="mr-2 h-4 w-4" />
                    Visão Geral
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => setActiveTab('analytics')}
                    variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => setActiveTab('projects')}
                    variant={activeTab === 'projects' ? 'default' : 'ghost'}
                  >
                    <Briefcase className="mr-2 h-4 w-4" />
                    Projetos
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => setActiveTab('tasks')}
                    variant={activeTab === 'tasks' ? 'default' : 'ghost'}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Tarefas
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => setActiveTab('team')}
                    variant={activeTab === 'team' ? 'default' : 'ghost'}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Equipe
                  </Button>
                  <Button
                    className="w-full justify-start"
                    onClick={() => setActiveTab('settings')}
                    variant={activeTab === 'settings' ? 'default' : 'ghost'}
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
          <Tabs onValueChange={setActiveTab} value={activeTab}>
            {/* Overview Tab */}
            <TabsContent className="space-y-6" value="overview">
              {/* Metrics Cards */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {MOCK_METRICS.map((metric) => (
                  <Card key={metric.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="font-medium text-sm">
                        {metric.label}
                      </CardTitle>
                      {getMetricIcon(metric)}
                    </CardHeader>
                    <CardContent>
                      <div className="font-bold text-2xl">
                        {metric.format === 'currency' &&
                          formatCurrency(metric.value)}
                        {metric.format === 'percentage' &&
                          formatPercentage(metric.value)}
                        {metric.format === 'number' &&
                          metric.value.toLocaleString()}
                      </div>
                      <p className={`text-xs ${getChangeColor(metric.change)}`}>
                        {metric.change > 0 ? '+' : ''}
                        {metric.change.toFixed(1)}% desde o período anterior
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Receita por Período</CardTitle>
                    <CardDescription>
                      Comparação dos últimos 6 meses
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-80 items-center justify-center text-gray-400">
                      <BarChart3 className="h-12 w-12" />
                      <span className="ml-2">Gráfico de receita</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribuição de Usuários</CardTitle>
                    <CardDescription>Por categoria de uso</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-80 items-center justify-center text-gray-400">
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
                  <CardDescription>Últimas ações dos usuários</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div className="flex items-center space-x-4" key={i}>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>U{i}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm">
                            Usuário {i} executou uma ação importante
                          </p>
                          <p className="text-gray-500 text-xs">
                            há {i} minuto{i > 1 ? 's' : ''}
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
            <TabsContent className="space-y-6" value="analytics">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-3xl">Analytics</h2>
                <div className="flex items-center space-x-2">
                  <Select onValueChange={setFilterStatus} value={filterStatus}>
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
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Tendências de Crescimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-96 items-center justify-center text-gray-400">
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
                      { label: 'Receita', current: 85, target: 100 },
                      { label: 'Usuários', current: 92, target: 100 },
                      { label: 'Satisfação', current: 78, target: 100 },
                    ].map((goal, i) => (
                      <div className="space-y-2" key={i}>
                        <div className="flex justify-between text-sm">
                          <span>{goal.label}</span>
                          <span>{goal.current}%</span>
                        </div>
                        <Progress className="h-2" value={goal.current} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent className="space-y-6" value="projects">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-3xl">Projetos</h2>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
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
                        <Textarea
                          id="project-desc"
                          placeholder="Descreva o projeto"
                        />
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

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Projeto {i}</CardTitle>
                        <Button size="sm" variant="ghost">
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
                          <div className="mb-2 flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{Math.floor(Math.random() * 100)}%</span>
                          </div>
                          <Progress value={Math.floor(Math.random() * 100)} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="-space-x-2 flex">
                            {[1, 2, 3].map((j) => (
                              <Avatar
                                className="h-6 w-6 border-2 border-white"
                                key={j}
                              >
                                <AvatarFallback className="text-xs">
                                  U{j}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          {getStatusBadge(
                            ['planning', 'active', 'on-hold', 'completed'][
                              Math.floor(Math.random() * 4)
                            ]
                          )}
                        </div>

                        <div className="text-gray-500 text-sm">
                          Entrega:{' '}
                          {format(
                            new Date(
                              Date.now() +
                                Math.random() * 30 * 24 * 60 * 60 * 1000
                            ),
                            'dd/MM/yyyy',
                            { locale: ptBR }
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent className="space-y-6" value="tasks">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-3xl">Tarefas</h2>
                <div className="flex items-center space-x-2">
                  <Select onValueChange={setFilterStatus} value={filterStatus}>
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
                    <Plus className="mr-2 h-4 w-4" />
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
                              <p className="text-gray-500 text-sm">
                                Descrição da tarefa {i}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  U{i}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">Usuário {i}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(
                              ['pending', 'in-progress', 'completed'][
                                Math.floor(Math.random() * 3)
                              ]
                            )}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(
                              ['low', 'medium', 'high', 'urgent'][
                                Math.floor(Math.random() * 4)
                              ]
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(
                              new Date(
                                Date.now() +
                                  Math.random() * 14 * 24 * 60 * 60 * 1000
                              ),
                              'dd/MM',
                              { locale: ptBR }
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost">
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
            <TabsContent className="space-y-6" value="team">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-3xl">Equipe</h2>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Convidar Membro
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {MOCK_USERS.map((user) => (
                  <Card key={user.id}>
                    <CardHeader>
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>
                            {user.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
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
                          <span className="text-gray-500 text-sm">Status</span>
                          {getStatusBadge(user.status)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm">
                            Departamento
                          </span>
                          <span className="text-sm">{user.department}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm">
                            Último acesso
                          </span>
                          <span className="text-sm">
                            {format(user.lastSeen, 'dd/MM HH:mm', {
                              locale: ptBR,
                            })}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                          <Button
                            className="flex-1"
                            size="sm"
                            variant="outline"
                          >
                            <Mail className="mr-1 h-4 w-4" />
                            Email
                          </Button>
                          <Button
                            className="flex-1"
                            size="sm"
                            variant="outline"
                          >
                            <MessageSquare className="mr-1 h-4 w-4" />
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
            <TabsContent className="space-y-6" value="settings">
              <h2 className="font-bold text-3xl">Configurações</h2>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                        <p className="text-gray-500 text-sm">
                          Receber notificações em tempo real
                        </p>
                      </div>
                      <Switch id="notifications" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="dark-mode">Modo Escuro</Label>
                        <p className="text-gray-500 text-sm">
                          Usar tema escuro
                        </p>
                      </div>
                      <Switch id="dark-mode" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auto-save">Salvamento Automático</Label>
                        <p className="text-gray-500 text-sm">
                          Salvar alterações automaticamente
                        </p>
                      </div>
                      <Switch defaultChecked id="auto-save" />
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
                        <p className="text-gray-500 text-sm">
                          Adicionar camada extra de segurança
                        </p>
                      </div>
                      <Switch id="2fa" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="session-timeout">
                          Timeout de Sessão
                        </Label>
                        <p className="text-gray-500 text-sm">
                          Deslogar automaticamente após inatividade
                        </p>
                      </div>
                      <Switch defaultChecked id="session-timeout" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-change">Alterar Senha</Label>
                      <Button size="sm" variant="outline">
                        <Key className="mr-2 h-4 w-4" />
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
  );
}
