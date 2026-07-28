import {
  Accordion,
  AccordionItem,
  AsciiArt,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  Chip,
  CodeBlock,
  ColorInput,
  Column,
  ContextMenu,
  CrossHatch,
  Dialog,
  Dither,
  Drawer,
  Dropdown,
  DropdownItem,
  EmptyState,
  ExternalIcon,
  Fieldset,
  Flex,
  Grid,
  Halftone,
  Heading,
  Icon,
  IconButton,
  InlineCode,
  Input,
  Kbd,
  Line,
  List,
  ListItem,
  MasonryGrid,
  Media,
  Meter,
  NumberInput,
  OTPInput,
  PasswordInput,
  Popover,
  Radio,
  RadioGroup,
  Row,
  SearchInput,
  Select,
  Skeleton,
  Slider,
  Stat,
  Switch,
  Tab,
  TabList,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TabPanel,
  Tabs,
  Text,
  Textarea,
  ToastProvider,
  Tooltip,
  useToast,
} from "@nmmty/dotmatrix";
import type { ComponentType, ReactNode } from "react";
import { FaHeart } from "react-icons/fa";

// A tiny (16x16, base64) gradient PNG — self-contained, no network fetch, so
// Dither/Halftone have a deterministic image to demo against.
const DEMO_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><rect width="96" height="96" fill="url(#g)"/><circle cx="30" cy="66" r="20" fill="#000"/><circle cx="70" cy="30" r="14" fill="#fff"/></svg>`,
  );

export type Category =
  | "Primitives"
  | "Typography & Display"
  | "Bitmap Graphics"
  | "Forms"
  | "Overlays & Navigation"
  | "Data Display";

export interface RegistryEntry {
  name: string;
  category: Category;
  // biome-ignore lint/suspicious/noExplicitAny: entries span components with unrelated prop shapes.
  Component: ComponentType<any>;
  props?: Record<string, unknown>;
  children?: ReactNode;
  /** Structural context a sub-part needs to render meaningfully (e.g. `Tab` inside `Tabs`/`TabList`). Not itself prop-controlled. */
  wrapper?: (node: ReactNode) => ReactNode;
}

function ToastDemo() {
  const { show } = useToast();
  return (
    <Button variant="solid" onClick={() => show({ title: "Saved", variant: "success" })}>
      Show toast
    </Button>
  );
}

export const REGISTRY: RegistryEntry[] = [
  // Primitives
  {
    name: "Flex",
    category: "Primitives",
    Component: Flex,
    props: { padding: "16", background: "raised", borderWidth: "1", borderColor: "weak" },
    children: "Flex",
  },
  {
    name: "Row",
    category: "Primitives",
    Component: Row,
    props: { gap: "8" },
    children: (
      <>
        <Flex padding="16" background="raised">
          A
        </Flex>
        <Flex padding="16" background="raised">
          B
        </Flex>
      </>
    ),
  },
  {
    name: "Column",
    category: "Primitives",
    Component: Column,
    props: { gap: "8" },
    children: (
      <>
        <Flex padding="16" background="raised">
          A
        </Flex>
        <Flex padding="16" background="raised">
          B
        </Flex>
      </>
    ),
  },
  {
    name: "Grid",
    category: "Primitives",
    Component: Grid,
    props: { columns: "3", gap: "8" },
    children: (
      <>
        <Flex padding="16" background="raised">
          A
        </Flex>
        <Flex padding="16" background="raised">
          B
        </Flex>
        <Flex padding="16" background="raised">
          C
        </Flex>
      </>
    ),
  },
  { name: "Line", category: "Primitives", Component: Line, props: {} },
  {
    name: "MasonryGrid",
    category: "Primitives",
    Component: MasonryGrid,
    props: { columns: 3, minColumnWidth: 160, gap: "16" },
    // A plain array, not a `<>...</>` Fragment: MasonryGrid wraps each child
    // individually via `Children.map`, which treats a Fragment passed as the
    // whole `children` value as a single child — every card would land
    // inside one `.item` instead of three.
    children: [
      <Card key="short" gap="8" shadow="s">
        <Text fontSize="s">Short note.</Text>
      </Card>,
      <Card key="long" gap="8" shadow="s">
        <Text fontSize="s">A somewhat longer note that wraps across a couple of lines.</Text>
      </Card>,
      <Card key="another" gap="8" shadow="s">
        <Text fontSize="s">Another note.</Text>
      </Card>,
    ],
  },

  // Typography & Display
  {
    name: "Text",
    category: "Typography & Display",
    Component: Text,
    props: { fontSize: "m" },
    children: "The quick brown fox.",
  },
  {
    name: "Heading",
    category: "Typography & Display",
    Component: Heading,
    props: { displaySize: "s" },
    children: "Section heading",
  },
  {
    name: "Button",
    category: "Typography & Display",
    Component: Button,
    props: { variant: "solid", size: "m", icon: "download" },
    children: "Download",
  },
  {
    name: "IconButton",
    category: "Typography & Display",
    Component: IconButton,
    props: { variant: "outline", "aria-label": "Delete", icon: "trash" },
  },
  {
    name: "Icon",
    category: "Typography & Display",
    Component: Icon,
    props: { name: "check", size: "m" },
  },
  {
    name: "ExternalIcon",
    category: "Typography & Display",
    Component: ExternalIcon,
    props: { icon: FaHeart, size: "m" },
  },
  {
    name: "Card",
    category: "Typography & Display",
    Component: Card,
    props: { gap: "8", shadow: "m" },
    children: (
      <>
        <Text weight="medium">Card title</Text>
        <Text fontSize="s" color="weak">
          Supporting copy for this card.
        </Text>
      </>
    ),
  },
  {
    name: "Badge",
    category: "Typography & Display",
    Component: Badge,
    props: { variant: "success" },
    children: "Active",
  },
  {
    name: "Chip",
    category: "Typography & Display",
    Component: Chip,
    props: { removeLabel: "Remove tag" },
    children: "design",
  },
  {
    name: "Avatar",
    category: "Typography & Display",
    Component: Avatar,
    props: { name: "Ada Lovelace", size: "m" },
  },
  { name: "Kbd", category: "Typography & Display", Component: Kbd, props: {}, children: "K" },
  {
    name: "InlineCode",
    category: "Typography & Display",
    Component: InlineCode,
    props: {},
    children: "pnpm build",
  },
  {
    name: "Skeleton",
    category: "Typography & Display",
    Component: Skeleton,
    props: { height: "16", width: "160" },
  },
  {
    name: "CodeBlock",
    category: "Typography & Display",
    Component: CodeBlock,
    props: {
      copyButton: true,
      codes: [
        { language: "tsx", label: "Example", code: '<Button variant="solid">Click me</Button>' },
      ],
    },
  },
  {
    name: "Media",
    category: "Typography & Display",
    Component: Media,
    props: { src: DEMO_IMAGE, alt: "Demo gradient", aspectRatio: "16 / 9" },
  },

  // Bitmap Graphics
  {
    name: "Dither",
    category: "Bitmap Graphics",
    Component: Dither,
    props: {
      src: DEMO_IMAGE,
      alt: "Demo gradient",
      width: 96,
      height: 96,
      algorithm: "floyd-steinberg",
      pixelSize: 2,
    },
  },
  {
    name: "Halftone",
    category: "Bitmap Graphics",
    Component: Halftone,
    props: { src: DEMO_IMAGE, alt: "Demo gradient", width: 96, height: 96, cellSize: 6 },
  },
  {
    name: "AsciiArt",
    category: "Bitmap Graphics",
    Component: AsciiArt,
    props: { src: DEMO_IMAGE, alt: "Demo gradient", width: 96, height: 96, cellSize: 8 },
  },
  {
    name: "CrossHatch",
    category: "Bitmap Graphics",
    Component: CrossHatch,
    props: { src: DEMO_IMAGE, alt: "Demo gradient", width: 96, height: 96, cellSize: 8 },
  },
  {
    name: "Meter",
    category: "Bitmap Graphics",
    Component: Meter,
    props: { value: 70, max: 100, label: "Budget spent" },
  },

  // Forms
  {
    name: "Input",
    category: "Forms",
    Component: Input,
    props: { label: "Email", placeholder: "ada@example.com" },
  },
  { name: "Textarea", category: "Forms", Component: Textarea, props: { label: "Bio", rows: 3 } },
  {
    name: "Select",
    category: "Forms",
    Component: Select,
    props: {
      label: "Country",
      defaultValue: "fr",
      options: [
        { value: "us", label: "United States" },
        { value: "fr", label: "France" },
        { value: "jp", label: "Japan" },
      ],
    },
  },
  {
    name: "Checkbox",
    category: "Forms",
    Component: Checkbox,
    props: { label: "Email me about updates", defaultChecked: true },
  },
  {
    name: "Radio",
    category: "Forms",
    Component: Radio,
    props: { value: "a", label: "Option A" },
    wrapper: (node) => (
      <RadioGroup label="Demo" defaultValue="a">
        {node}
      </RadioGroup>
    ),
  },
  {
    name: "RadioGroup",
    category: "Forms",
    Component: RadioGroup,
    props: { label: "Plan", defaultValue: "free" },
    children: (
      <>
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
      </>
    ),
  },
  {
    name: "Switch",
    category: "Forms",
    Component: Switch,
    props: { label: "Push notifications", defaultChecked: true },
  },
  {
    name: "Slider",
    category: "Forms",
    Component: Slider,
    props: { label: "Volume", min: 0, max: 100, defaultValue: 60 },
  },
  {
    name: "NumberInput",
    category: "Forms",
    Component: NumberInput,
    props: { label: "Quantity", min: 0, max: 10, defaultValue: 3 },
  },
  {
    name: "SearchInput",
    category: "Forms",
    Component: SearchInput,
    props: { label: "Search", placeholder: "Find a component…" },
  },
  {
    name: "Fieldset",
    category: "Forms",
    Component: Fieldset,
    props: { legend: "Preferences" },
    children: (
      <>
        <Checkbox label="Email me about updates" defaultChecked />
        <Switch label="Push notifications" />
      </>
    ),
  },
  {
    name: "PasswordInput",
    category: "Forms",
    Component: PasswordInput,
    props: { label: "Password", placeholder: "••••••••" },
  },
  {
    name: "OTPInput",
    category: "Forms",
    Component: OTPInput,
    props: { label: "Verification code", length: 6 },
  },
  {
    name: "ColorInput",
    category: "Forms",
    Component: ColorInput,
    props: { label: "Accent color", defaultValue: "#ff6a00" },
  },

  // Overlays & Navigation
  {
    name: "Dialog",
    category: "Overlays & Navigation",
    Component: Dialog,
    props: {
      title: "Delete item?",
      description: "This can't be undone.",
      trigger: <Button size="s">Open dialog</Button>,
    },
    children: (
      <Row gap="8" justifyContent="end">
        <Button size="s" variant="outline">
          Cancel
        </Button>
        <Button size="s">Delete</Button>
      </Row>
    ),
  },
  {
    name: "Drawer",
    category: "Overlays & Navigation",
    Component: Drawer,
    props: { title: "Settings", side: "right", trigger: <Button size="s">Open drawer</Button> },
    children: (
      <Text fontSize="s" color="weak">
        Drawer content slides in from the edge.
      </Text>
    ),
  },
  {
    name: "Dropdown",
    category: "Overlays & Navigation",
    Component: Dropdown,
    props: {
      trigger: (
        <Button size="s" variant="outline">
          Actions
        </Button>
      ),
    },
    children: (
      <>
        <DropdownItem>Edit</DropdownItem>
        <DropdownItem>Duplicate</DropdownItem>
      </>
    ),
  },
  {
    name: "DropdownItem",
    category: "Overlays & Navigation",
    Component: DropdownItem,
    props: {},
    children: "Edit",
    wrapper: (node) => (
      <Dropdown
        trigger={
          <Button size="s" variant="outline">
            Actions
          </Button>
        }
      >
        {node}
      </Dropdown>
    ),
  },
  {
    name: "Tooltip",
    category: "Overlays & Navigation",
    Component: Tooltip,
    props: { content: "Save your work" },
    children: (
      <Button size="s" variant="outline">
        Hover me
      </Button>
    ),
  },
  {
    name: "Popover",
    category: "Overlays & Navigation",
    Component: Popover,
    props: { trigger: <Button size="s">Click me</Button> },
    children: <Text fontSize="s">Quick settings</Text>,
  },
  {
    name: "ContextMenu",
    category: "Overlays & Navigation",
    Component: ContextMenu,
    props: {
      menu: (
        <>
          <DropdownItem>Copy</DropdownItem>
          <DropdownItem>Paste</DropdownItem>
        </>
      ),
    },
    children: (
      <Flex
        width="160"
        height="64"
        alignItems="center"
        justifyContent="center"
        background="raised"
        fontSize="s"
        color="weak"
      >
        Right-click me
      </Flex>
    ),
  },
  {
    name: "Tabs",
    category: "Overlays & Navigation",
    Component: Tabs,
    props: { defaultValue: "a" },
    children: (
      <>
        <TabList aria-label="Demo tabs">
          <Tab value="a">Overview</Tab>
          <Tab value="b">Activity</Tab>
        </TabList>
        <TabPanel value="a">
          <Text fontSize="s" color="weak">
            Overview panel content.
          </Text>
        </TabPanel>
        <TabPanel value="b">
          <Text fontSize="s" color="weak">
            Activity panel content.
          </Text>
        </TabPanel>
      </>
    ),
  },
  {
    name: "Tab",
    category: "Overlays & Navigation",
    Component: Tab,
    props: { value: "a" },
    children: "Overview",
    wrapper: (node) => (
      <Tabs defaultValue="a">
        <TabList aria-label="Demo tabs">{node}</TabList>
      </Tabs>
    ),
  },
  {
    name: "TabList",
    category: "Overlays & Navigation",
    Component: TabList,
    props: { "aria-label": "Demo tabs" },
    children: <Tab value="a">Overview</Tab>,
    wrapper: (node) => <Tabs defaultValue="a">{node}</Tabs>,
  },
  {
    name: "TabPanel",
    category: "Overlays & Navigation",
    Component: TabPanel,
    props: { value: "a" },
    children: (
      <Text fontSize="s" color="weak">
        Panel content.
      </Text>
    ),
    wrapper: (node) => <Tabs defaultValue="a">{node}</Tabs>,
  },
  {
    name: "Accordion",
    category: "Overlays & Navigation",
    Component: Accordion,
    props: { defaultValue: "a" },
    children: (
      <>
        <AccordionItem value="a" title="What is dotmatrix?">
          <Text fontSize="s" color="weak">
            A monochrome bitmap design system.
          </Text>
        </AccordionItem>
        <AccordionItem value="b" title="Is it accessible?">
          <Text fontSize="s" color="weak">
            Native elements and ARIA wiring throughout.
          </Text>
        </AccordionItem>
      </>
    ),
  },
  {
    name: "AccordionItem",
    category: "Overlays & Navigation",
    Component: AccordionItem,
    props: { value: "a", title: "What is dotmatrix?" },
    children: (
      <Text fontSize="s" color="weak">
        A monochrome bitmap design system.
      </Text>
    ),
    wrapper: (node) => <Accordion defaultValue="a">{node}</Accordion>,
  },
  {
    name: "ToastProvider",
    category: "Overlays & Navigation",
    Component: ToastProvider,
    children: <ToastDemo />,
  },

  // Data Display
  {
    name: "Table",
    category: "Data Display",
    Component: Table,
    props: { zebra: true },
    children: (
      <>
        <TableHead>
          <tr>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Ada Lovelace</TableCell>
            <TableCell>
              <Badge variant="success">Active</Badge>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Alan Turing</TableCell>
            <TableCell>
              <Badge>Invited</Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </>
    ),
  },
  {
    name: "TableHead",
    category: "Data Display",
    Component: TableHead,
    props: {},
    children: (
      <tr>
        <TableHeaderCell>Name</TableHeaderCell>
      </tr>
    ),
    wrapper: (node) => <Table>{node}</Table>,
  },
  {
    name: "TableBody",
    category: "Data Display",
    Component: TableBody,
    props: {},
    children: (
      <TableRow>
        <TableCell>Ada Lovelace</TableCell>
      </TableRow>
    ),
    wrapper: (node) => <Table>{node}</Table>,
  },
  {
    name: "TableRow",
    category: "Data Display",
    Component: TableRow,
    props: {},
    children: <TableCell>Ada Lovelace</TableCell>,
    wrapper: (node) => (
      <Table>
        <TableBody>{node}</TableBody>
      </Table>
    ),
  },
  {
    name: "TableCell",
    category: "Data Display",
    Component: TableCell,
    props: {},
    children: "Ada Lovelace",
    wrapper: (node) => (
      <Table>
        <TableBody>
          <TableRow>{node}</TableRow>
        </TableBody>
      </Table>
    ),
  },
  {
    name: "TableHeaderCell",
    category: "Data Display",
    Component: TableHeaderCell,
    props: {},
    children: "Name",
    wrapper: (node) => (
      <Table>
        <TableHead>
          <tr>{node}</tr>
        </TableHead>
      </Table>
    ),
  },
  {
    name: "List",
    category: "Data Display",
    Component: List,
    children: (
      <>
        <ListItem title="Invoice #1042" description="Due Feb 1" />
        <ListItem title="Invoice #1041" description="Paid Jan 3" />
      </>
    ),
  },
  {
    name: "ListItem",
    category: "Data Display",
    Component: ListItem,
    props: { title: "Invoice #1042", description: "Due Feb 1" },
    wrapper: (node) => <List>{node}</List>,
  },
  {
    name: "Stat",
    category: "Data Display",
    Component: Stat,
    props: { label: "Revenue", value: "$12.4k", trend: { direction: "up", value: "+8%" } },
  },
  {
    name: "EmptyState",
    category: "Data Display",
    Component: EmptyState,
    props: {
      title: "No results",
      description: "Try a different search term.",
      icon: <Icon name="search" size="l" />,
    },
  },
];

export function getRegistryEntry(name: string): RegistryEntry | undefined {
  return REGISTRY.find((entry) => entry.name === name);
}
