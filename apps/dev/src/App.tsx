import {
  Accordion,
  AccordionItem,
  Avatar,
  Badge,
  type BorderStyle,
  Button,
  Card,
  Checkbox,
  Chip,
  ColorInput,
  Column,
  ContextMenu,
  type Density,
  Dialog,
  Dither,
  type DitherAlgorithm,
  Drawer,
  Dropdown,
  DropdownItem,
  EmptyState,
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
  Meter,
  NumberInput,
  OTPInput,
  type Palette,
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
  ThemeProvider,
  ToastProvider,
  Tooltip,
  useTheme,
  useToast,
} from "@dotmatrix/core";
import { useState } from "react";

// A self-contained SVG data URI (no network fetch, deterministic) used to
// demo Dither/Halftone: a gradient background plus two solid circles, enough
// tonal range to show how each algorithm handles both smooth gradients and
// hard edges.
const DEMO_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#202020" />
        </linearGradient>
      </defs>
      <rect width="200" height="200" fill="url(#g)" />
      <circle cx="60" cy="140" r="42" fill="#000000" />
      <circle cx="145" cy="65" r="30" fill="#ffffff" />
    </svg>`,
  );

function ThemeControls() {
  const { theme, setTheme, palette, setPalette, border, setBorder, density, setDensity } =
    useTheme();

  return (
    <Row gap="8" wrap="wrap">
      <Button size="s" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        theme: {theme}
      </Button>
      <Button
        size="s"
        variant="outline"
        onClick={() => {
          const order: Palette[] = ["mono", "orange", "blue", "green", "purple", "red"];
          setPalette(order[(order.indexOf(palette) + 1) % order.length]!);
        }}
      >
        palette: {palette}
      </Button>
      <Button
        size="s"
        variant="outline"
        onClick={() => {
          const order: BorderStyle[] = ["rounded", "notched", "square"];
          setBorder(order[(order.indexOf(border) + 1) % order.length]!);
        }}
      >
        border: {border}
      </Button>
      <Button
        size="s"
        variant="outline"
        onClick={() => {
          const order: Density[] = ["compact", "normal", "comfortable"];
          setDensity(order[(order.indexOf(density) + 1) % order.length]!);
        }}
      >
        density: {density}
      </Button>
    </Row>
  );
}

function PatternSwatch({
  step,
}: {
  step: "0" | "2" | "4" | "6" | "8" | "10" | "12" | "14" | "16";
}) {
  return (
    <Column alignItems="center" gap="4">
      <Flex width="40" height="40" background="page" borderWidth="1" borderColor="weak">
        <Flex width="full" height="full" pattern={step} />
      </Flex>
      <Text fontSize="2xs" color="weak" font="mono">
        {step}
      </Text>
    </Column>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card as="section" shadow="m">
      <Heading as="h2" displaySize="xs">
        {title}
      </Heading>
      <Line />
      {children}
    </Card>
  );
}

function ComponentsShowcase() {
  const [tags, setTags] = useState(["design", "bitmap", "react"]);
  const [loading, setLoading] = useState(true);

  return (
    <Column gap="24">
      <Column gap="8">
        <Text fontSize="xs" color="weak" uppercase tracking="wide">
          Button
        </Text>
        <Row gap="12" wrap="wrap" alignItems="center">
          <Button variant="solid">Solid</Button>
          <Button variant="outline" icon="download">
            Outline
          </Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="solid" disabled>
            Disabled
          </Button>
          <IconButton aria-label="Delete" variant="outline" icon="trash" />
          {/* `palette` scopes the accent locally — this button is blue
              regardless of the global palette picker above. */}
          <Button variant="solid" palette="blue">
            Local palette
          </Button>
        </Row>
      </Column>

      <Column gap="8">
        <Text fontSize="xs" color="weak" uppercase tracking="wide">
          Badge / Chip
        </Text>
        <Row gap="8" wrap="wrap" alignItems="center">
          <Badge>Neutral</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="success">Success</Badge>
          {tags.map((tag) => (
            <Chip
              key={tag}
              onRemove={() => setTags((t) => t.filter((x) => x !== tag))}
              removeLabel={`Remove ${tag}`}
            >
              {tag}
            </Chip>
          ))}
        </Row>
      </Column>

      <Column gap="8">
        <Text fontSize="xs" color="weak" uppercase tracking="wide">
          Avatar / Kbd / InlineCode
        </Text>
        <Row gap="12" wrap="wrap" alignItems="center">
          <Avatar name="Ada Lovelace" size="s" />
          <Avatar name="Grace Hopper" size="m" />
          <Avatar name="Katherine Johnson" size="l" />
          <Row gap="4" alignItems="center">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </Row>
          <Text fontSize="s">
            Run <InlineCode>pnpm build</InlineCode> to compile.
          </Text>
        </Row>
      </Column>

      <Column gap="8">
        <Text fontSize="xs" color="weak" uppercase tracking="wide">
          Icons
        </Text>
        <Row gap="12" wrap="wrap" alignItems="center">
          <Icon name="check" title="Check" />
          <Icon name="close" title="Close" />
          <Icon name="plus" title="Plus" />
          <Icon name="minus" title="Minus" />
          <Icon name="search" title="Search" />
          <Icon name="info" title="Info" />
          <Icon name="warning" title="Warning" />
        </Row>
      </Column>

      <Column gap="8">
        <Row justifyContent="between" alignItems="center">
          <Text fontSize="xs" color="weak" uppercase tracking="wide">
            Skeleton
          </Text>
          <Button size="s" variant="ghost" onClick={() => setLoading((v) => !v)}>
            toggle
          </Button>
        </Row>
        {loading ? (
          <Column gap="8">
            <Skeleton height="16" width="full" />
            <Skeleton height="16" width="160" />
            <Row gap="8" alignItems="center">
              <Skeleton circle width="32" height="32" />
              <Skeleton height="12" width="128" />
            </Row>
          </Column>
        ) : (
          <Row gap="8" alignItems="center">
            <Avatar name="Loaded State" size="m" />
            <Text fontSize="s">Content has loaded.</Text>
          </Row>
        )}
      </Column>
    </Column>
  );
}

function BudgetCard() {
  const spent = 1400;
  const limit = 2000;
  return (
    <Card gap="16" shadow="m">
      <Row justifyContent="between" alignItems="baseline">
        <Text font="display" fontSize="l" tracking="display" uppercase>
          Budget
        </Text>
      </Row>
      <Row justifyContent="between">
        <Text fontSize="s" color="medium">
          Spent: ${spent}
        </Text>
        <Text fontSize="s" color="medium">
          Limit: ${limit}
        </Text>
      </Row>
      <Meter value={spent} max={limit} label="Budget spent" />
      <Text fontSize="s" color="weak">
        You're getting close to your limit. Consider slowing down spending.
      </Text>
    </Card>
  );
}

const DITHER_ALGORITHMS: Array<{ label: string; algorithm: DitherAlgorithm }> = [
  { label: "Floyd–Steinberg", algorithm: "floyd-steinberg" },
  { label: "Atkinson", algorithm: "atkinson" },
  { label: "Bayer 4×4", algorithm: "bayer4" },
  { label: "Threshold", algorithm: "threshold" },
];

function BitmapShowcase() {
  return (
    <Column gap="24">
      <Column gap="8">
        <Text fontSize="xs" color="weak" uppercase tracking="wide">
          Dither — same image, four algorithms
        </Text>
        <Row gap="16" wrap="wrap">
          {DITHER_ALGORITHMS.map(({ label, algorithm }) => (
            <Column key={algorithm} gap="4" alignItems="center">
              <Dither
                src={DEMO_IMAGE}
                alt={`Demo gradient, dithered with ${label}`}
                width={96}
                height={96}
                algorithm={algorithm}
                pixelSize={2}
              />
              <Text fontSize="2xs" color="weak">
                {label}
              </Text>
            </Column>
          ))}
        </Row>
      </Column>

      <Column gap="8">
        <Text fontSize="xs" color="weak" uppercase tracking="wide">
          Halftone
        </Text>
        <Row gap="16" wrap="wrap" alignItems="center">
          <Halftone
            src={DEMO_IMAGE}
            alt="Demo gradient, halftone screen"
            width={96}
            height={96}
            cellSize={6}
          />
          <Halftone
            src={DEMO_IMAGE}
            alt="Demo gradient, coarse halftone screen"
            width={96}
            height={96}
            cellSize={12}
          />
        </Row>
      </Column>
    </Column>
  );
}

function FormsShowcase() {
  const [plan, setPlan] = useState("pro");
  const [notifications, setNotifications] = useState(true);
  const [volume, setVolume] = useState(60);
  const [quantity, setQuantity] = useState(3);
  const [search, setSearch] = useState("");

  return (
    <Grid columns="2" gap="24" m={{ columns: "1" }}>
      <Column gap="16">
        <Input label="Email" type="email" placeholder="ada@example.com" required />
        <Input label="Amount" icon="filter" placeholder="0.00" pattern="[0-9]*\.?[0-9]*" />
        <Input
          label="Username"
          defaultValue="a"
          error="Must be at least 3 characters."
          description="This won't be shown if there's an error."
        />
        <Textarea label="Bio" description="A couple of sentences about you." rows={3} />
        <Select label="Country" defaultValue="fr">
          <option value="us">United States</option>
          <option value="fr">France</option>
          <option value="jp">Japan</option>
        </Select>
        <SearchInput
          label="Search"
          placeholder="Find a component…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <PasswordInput label="Password" placeholder="••••••••" />
      </Column>

      <Column gap="16">
        <NumberInput
          label="Quantity"
          min={0}
          max={10}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
        <Slider
          label="Volume"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(e.target.valueAsNumber)}
          description={`${volume}%`}
        />
        <Fieldset legend="Preferences">
          <Checkbox label="Email me about updates" defaultChecked />
          <Switch
            label="Push notifications"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
        </Fieldset>
        <RadioGroup label="Plan" value={plan} onChange={setPlan}>
          <Radio value="free" label="Free" />
          <Radio value="pro" label="Pro" />
          <Radio value="team" label="Team" />
        </RadioGroup>
        <OTPInput label="Verification code" length={6} />
        <ColorInput
          label="Accent color"
          defaultValue="#ff6a00"
          swatches={["#1a0f00", "#4d2b00", "#ff6a00", "#ff9d4d", "#ffd9b3"]}
        />
      </Column>
    </Grid>
  );
}

function OverlaysShowcase() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { show } = useToast();

  return (
    <Column gap="24">
      <Column gap="8">
        <Text fontSize="xs" color="weak" uppercase tracking="wide">
          Tooltip / Popover / Dropdown / Context menu
        </Text>
        <Row gap="12" wrap="wrap" alignItems="center">
          <Tooltip content="Save your work">
            <Button size="s" variant="outline">
              Hover me
            </Button>
          </Tooltip>

          <Popover trigger={<Button size="s">Click me</Button>}>
            <Column gap="8" width="160">
              <Text fontSize="s" weight="medium">
                Quick settings
              </Text>
              <Checkbox label="Enable feature" defaultChecked />
            </Column>
          </Popover>

          <Dropdown
            trigger={
              <Button size="s" variant="outline">
                Actions
              </Button>
            }
          >
            <DropdownItem onSelect={() => show({ title: "Edited" })}>Edit</DropdownItem>
            <DropdownItem onSelect={() => show({ title: "Duplicated" })}>Duplicate</DropdownItem>
            <DropdownItem onSelect={() => show({ title: "Deleted", variant: "error" })}>
              Delete
            </DropdownItem>
          </Dropdown>

          <ContextMenu
            menu={
              <>
                <DropdownItem onSelect={() => show({ title: "Copied" })}>Copy</DropdownItem>
                <DropdownItem onSelect={() => show({ title: "Pasted" })}>Paste</DropdownItem>
              </>
            }
          >
            <Flex
              width="160"
              height="64"
              alignItems="center"
              justifyContent="center"
              background="raised"
              borderWidth="1"
              borderColor="weak"
              radius="control"
              fontSize="s"
              color="weak"
            >
              Right-click me
            </Flex>
          </ContextMenu>
        </Row>
      </Column>

      <Column gap="8">
        <Text fontSize="xs" color="weak" uppercase tracking="wide">
          Dialog / Drawer / Toast
        </Text>
        <Row gap="12" wrap="wrap" alignItems="center">
          <Button size="s" onClick={() => setDialogOpen(true)}>
            Open dialog
          </Button>
          <Dialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            title="Delete item?"
            description="This can't be undone."
          >
            <Row gap="8" justifyContent="end">
              <Button size="s" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                size="s"
                onClick={() => {
                  setDialogOpen(false);
                  show({ title: "Item deleted", variant: "error" });
                }}
              >
                Delete
              </Button>
            </Row>
          </Dialog>

          <Button size="s" variant="outline" onClick={() => setDrawerOpen(true)}>
            Open drawer
          </Button>
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen} side="right" title="Settings">
            <Text fontSize="s" color="weak">
              Drawer content slides in from the right edge.
            </Text>
          </Drawer>

          <Button
            size="s"
            variant="ghost"
            onClick={() =>
              show({ title: "Saved", description: "Your changes were saved.", variant: "success" })
            }
          >
            Show toast
          </Button>
        </Row>
      </Column>

      <Column gap="8">
        <Text fontSize="xs" color="weak" uppercase tracking="wide">
          Tabs
        </Text>
        <Tabs defaultValue="a">
          <TabList aria-label="Demo tabs">
            <Tab value="a">Overview</Tab>
            <Tab value="b">Activity</Tab>
            <Tab value="c" disabled>
              Disabled
            </Tab>
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
        </Tabs>
      </Column>

      <Column gap="8">
        <Text fontSize="xs" color="weak" uppercase tracking="wide">
          Accordion
        </Text>
        <Accordion defaultValue="a">
          <AccordionItem value="a" title="What is @dotmatrix?">
            <Text fontSize="s" color="weak">
              A monochrome bitmap design system.
            </Text>
          </AccordionItem>
          <AccordionItem value="b" title="Is it accessible?">
            <Text fontSize="s" color="weak">
              Native elements and ARIA wiring throughout.
            </Text>
          </AccordionItem>
        </Accordion>
      </Column>
    </Column>
  );
}

const USERS = [
  { id: 1, name: "Ada Lovelace", role: "Admin", status: "Active" as const },
  { id: 2, name: "Grace Hopper", role: "Editor", status: "Active" as const },
  { id: 3, name: "Alan Turing", role: "Viewer", status: "Invited" as const },
];

const MASONRY_NOTES = [
  { title: "Shopping list", body: "Milk, eggs, bread." },
  {
    title: "Trip planning",
    body: "Book flights, reserve the cabin, confirm the rental car, pack the hiking boots, check the weather forecast one more time before we leave.",
  },
  { title: "Quick idea", body: "Bitmap patterns for chart fills." },
  {
    title: "Meeting notes",
    body: "Discussed Q3 roadmap. Table and List components are done; MasonryGrid is next. Docs site is still pending for Phase 7.",
  },
  { title: "Reminder", body: "Renew the domain." },
  {
    title: "Book recommendation",
    body: "Designing Interfaces, for the pattern reference chapter.",
  },
];

function DataDisplayShowcase() {
  const [sortDirection, setSortDirection] = useState<"ascending" | "descending">("ascending");
  const [selectedId, setSelectedId] = useState(1);
  const [showResults, setShowResults] = useState(true);

  const sortedUsers = [...USERS].sort((a, b) =>
    sortDirection === "ascending" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name),
  );

  return (
    <Column gap="24">
      <Column gap="8">
        <Text fontSize="xs" color="weak" uppercase tracking="wide">
          Table
        </Text>
        <Table zebra>
          <TableHead>
            <tr>
              <TableHeaderCell
                sortDirection={sortDirection}
                onSort={() =>
                  setSortDirection((d) => (d === "ascending" ? "descending" : "ascending"))
                }
              >
                Name
              </TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </tr>
          </TableHead>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow
                key={user.id}
                selected={user.id === selectedId}
                onClick={() => setSelectedId(user.id)}
              >
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "Active" ? "success" : "neutral"}>
                    {user.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Column>

      <Grid columns="2" gap="24" m={{ columns: "1" }}>
        <Column gap="8">
          <Text fontSize="xs" color="weak" uppercase tracking="wide">
            List
          </Text>
          <List>
            <ListItem
              title="Invoice #1042"
              description="Due Feb 1"
              action={
                <Button size="s" variant="outline">
                  Pay
                </Button>
              }
            />
            <ListItem
              title="Invoice #1041"
              description="Paid Jan 3"
              action={<Badge variant="success">Paid</Badge>}
            />
            <ListItem
              title="Invoice #1040"
              description="Overdue since Dec 20"
              action={<Badge variant="error">Overdue</Badge>}
            />
          </List>
        </Column>

        <Column gap="8">
          <Text fontSize="xs" color="weak" uppercase tracking="wide">
            Stat
          </Text>
          <Row gap="24" wrap="wrap">
            <Stat label="Revenue" value="$12.4k" trend={{ direction: "up", value: "+8%" }} />
            <Stat label="Errors" value="3" trend={{ direction: "down", value: "-40%" }} />
          </Row>
        </Column>
      </Grid>

      <Column gap="8">
        <Row justifyContent="between" alignItems="center">
          <Text fontSize="xs" color="weak" uppercase tracking="wide">
            Empty state
          </Text>
          <Button size="s" variant="ghost" onClick={() => setShowResults((v) => !v)}>
            toggle
          </Button>
        </Row>
        {showResults ? (
          <Text fontSize="s" color="weak">
            (Results would render here.)
          </Text>
        ) : (
          <EmptyState
            icon={<Icon name="search" size="l" />}
            title="No results"
            description="Try a different search term."
            action={
              <Button size="s" variant="outline" onClick={() => setShowResults(true)}>
                Clear filters
              </Button>
            }
          />
        )}
      </Column>

      <Column gap="8">
        <Text fontSize="xs" color="weak" uppercase tracking="wide">
          Masonry grid
        </Text>
        <MasonryGrid columns={3} minColumnWidth={200} gap="16">
          {MASONRY_NOTES.map((note) => (
            <Card key={note.title} gap="8" shadow="s">
              <Text fontSize="s" weight="medium">
                {note.title}
              </Text>
              <Text fontSize="s" color="weak">
                {note.body}
              </Text>
            </Card>
          ))}
        </MasonryGrid>
      </Column>
    </Column>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Column
          as="main"
          gap="40"
          padding="40"
          minHeight="screen"
          background="page"
          color="strong"
          font="mono"
        >
          <Row justifyContent="between" alignItems="center" wrap="wrap" gap="16">
            <Heading as="h1" displaySize="s">
              @dotmatrix
            </Heading>
            <ThemeControls />
          </Row>

          <Grid columns="3" gap="24" m={{ columns: "1" }}>
            <Section title="Row / Column">
              <Row gap="16" wrap="wrap" m={{ direction: "column" }}>
                {["a", "b", "c"].map((k) => (
                  <Flex
                    key={k}
                    width="64"
                    height="64"
                    background="raised"
                    borderWidth="1"
                    borderColor="weak"
                    radius="control"
                    alignItems="center"
                    justifyContent="center"
                    font="pixel"
                    uppercase
                  >
                    {k}
                  </Flex>
                ))}
              </Row>
              <Text fontSize="s" color="medium">
                Resize the window past the m breakpoint — this row collapses to a column via{" "}
                <InlineCode>m={'{{ direction: "column" }}'}</InlineCode>, no JS.
              </Text>
            </Section>

            <Section title="Pattern density">
              <Row gap="12" wrap="wrap">
                {(["0", "2", "4", "6", "8", "10", "12", "14", "16"] as const).map((step) => (
                  <PatternSwatch key={step} step={step} />
                ))}
              </Row>
            </Section>

            <Section title="Typography">
              <Column gap="8">
                <Flex font="display" displaySize="xs" tracking="display">
                  DISPLAY
                </Flex>
                <Text font="mono" fontSize="m">
                  Body text in Geist Mono.
                </Text>
                <Text font="pixel" fontSize="s" color="medium">
                  Pixel slot — swap to Departure Mono.
                </Text>
              </Column>
            </Section>

            <BudgetCard />
          </Grid>

          <Section title="Components">
            <ComponentsShowcase />
          </Section>

          <Section title="Bitmap graphics">
            <BitmapShowcase />
          </Section>

          <Section title="Forms">
            <FormsShowcase />
          </Section>

          <Section title="Overlays and navigation">
            <OverlaysShowcase />
          </Section>

          <Section title="Data display">
            <DataDisplayShowcase />
          </Section>
        </Column>
      </ToastProvider>
    </ThemeProvider>
  );
}

export { App };
