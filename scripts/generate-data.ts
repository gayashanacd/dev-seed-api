/**
 * Seeded data generator: grows the datasets in src/api/packs/<pack>/data with realistic,
 * deterministic records whose foreign keys, totals and dates are consistent.
 *
 *   npm run generate:data            rewrite the JSON files
 *   npm run generate:data -- --check exit 1 if the committed files are not what the generator produces
 *
 * Compatibility rule: the first KEEP[entity] records of each file existed before the generator and
 * real users may rely on them (u1 is John Doe, p1 is the Wireless Mouse...). They are never changed.
 * Generated records are appended after them, with later dates and the next ids.
 *
 * Output depends only on the kept records and this file. Each entity has its own random stream, so
 * changing one entity's generator does not reshuffle the others (unless they depend on its output).
 */
import fs from "fs"
import path from "path"

type Rec = Record<string, any>
export type Datasets = Record<EntityName, Rec[]>

const DATA_DIR = path.join(__dirname, "../src/api/packs")

export const FILES = {
    users: "core/data/users.json",
    categories: "ecommerce/data/categories.json",
    products: "ecommerce/data/products.json",
    reviews: "ecommerce/data/reviews.json",
    orders: "ecommerce/data/orders.json",
    cart: "ecommerce/data/cart.json",
    coupons: "ecommerce/data/coupons.json",
    organizations: "startup/data/organizations.json",
    projects: "startup/data/projects.json",
    tasks: "startup/data/tasks.json",
    subscriptions: "startup/data/subscriptions.json",
    invoices: "startup/data/invoices.json",
    notifications: "startup/data/notifications.json"
} as const

type EntityName = keyof typeof FILES

/** Hand-written records that predate the generator. Never modified. */
export const KEEP: Record<EntityName, number> = {
    users: 25, categories: 12, products: 20, reviews: 15, orders: 15, cart: 12, coupons: 12,
    organizations: 10, projects: 10, tasks: 3, subscriptions: 2, invoices: 2, notifications: 2
}

/** Final record counts. Subscriptions (one per organization) and invoices (one per billing cycle) are derived. */
const TARGET = {
    users: 100, products: 120, reviews: 400, orders: 200, cart: 60, coupons: 25,
    organizations: 30, projects: 120, tasks: 600, notifications: 300
}

// Generated records fall between the hand-written data (Jan–Mar 2026) and "now" in the data.
const WINDOW_START = Date.parse("2026-03-15T00:00:00Z")
const NOW = Date.parse("2026-11-01T00:00:00Z")
const DAY = 24 * 60 * 60 * 1000

// ---------------------------------------------------------------------------------------------
// Deterministic randomness
// ---------------------------------------------------------------------------------------------

const hashSeed = (text: string) => {
    let h = 2166136261
    for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619)
    return h >>> 0
}

class Random {
    private state: number

    constructor(name: string) {
        this.state = hashSeed(`devseed:${name}`)
    }

    /** mulberry32 */
    next(): number {
        this.state = (this.state + 0x6d2b79f5) | 0
        let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }

    int(min: number, max: number) {
        return min + Math.floor(this.next() * (max - min + 1))
    }

    chance(p: number) {
        return this.next() < p
    }

    pick<T>(items: readonly T[]): T {
        if (items.length === 0) throw new Error("pick from empty list")
        return items[Math.floor(this.next() * items.length)]
    }

    weighted<T>(entries: readonly (readonly [T, number])[]): T {
        const total = entries.reduce((sum, [, w]) => sum + w, 0)
        let roll = this.next() * total
        for (const [value, weight] of entries) {
            roll -= weight
            if (roll < 0) return value
        }
        return entries[entries.length - 1][0]
    }

    sample<T>(items: readonly T[], n: number): T[] {
        const copy = [...items]
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1))
            ;[copy[i], copy[j]] = [copy[j], copy[i]]
        }
        return copy.slice(0, n)
    }

    /** n ascending timestamps in [start, end], rounded to the minute */
    timeline(start: number, end: number, n: number): number[] {
        return Array.from({ length: n }, () => start + this.next() * (end - start))
            .map(t => Math.floor(t / 60000) * 60000)
            .sort((a, b) => a - b)
    }
}

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------

/** Same format as the hand-written data: 2026-03-03T10:00:00Z */
const iso = (ms: number) => new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z")
const midnight = (ms: number) => Math.floor(ms / DAY) * DAY
const ts = (value: string) => Date.parse(value)
const round2 = (n: number) => Math.round(n * 100) / 100
const idNumber = (id: string) => Number(id.match(/(\d+)$/)![1])

const addMonths = (ms: number, months: number) => {
    const d = new Date(ms)
    d.setUTCMonth(d.getUTCMonth() + months)
    return d.getTime()
}

/** Continues an id sequence: ("u", 25 existing) → "u26", "u27"... */
const idMaker = (records: Rec[], prefix: string) => {
    let n = Math.max(0, ...records.map(r => idNumber(String(r.id))))
    return () => `${prefix}${++n}`
}

const uniqueName = (rnd: Random, used: Set<string>, make: () => string) => {
    for (let attempt = 0; attempt < 1000; attempt++) {
        const name = make()
        if (!used.has(name)) {
            used.add(name)
            return name
        }
    }
    throw new Error("ran out of unique names; add more vocabulary")
}

// ---------------------------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------------------------

const MALE_FIRST = ["James", "Liam", "Noah", "Ethan", "Lucas", "Mason", "Logan", "Owen", "Caleb", "Ryan",
    "Nathan", "Isaac", "Aaron", "Adrian", "Marcus", "Omar", "Mateo", "Diego", "Arjun", "Kenji",
    "Samuel", "Gabriel", "Julian", "Elijah", "Leo", "Theo", "Felix", "Hugo", "Andre", "Malik"]
const FEMALE_FIRST = ["Olivia", "Emma", "Ava", "Sophia", "Mia", "Amelia", "Harper", "Ella", "Chloe", "Grace",
    "Zoe", "Lily", "Nora", "Hannah", "Leah", "Aria", "Maya", "Priya", "Yuki", "Sofia",
    "Isabel", "Camila", "Elena", "Ruby", "Ivy", "Clara", "Naomi", "Freya", "Amara", "Leila"]
const LAST_NAMES = ["Anderson", "Bennett", "Carter", "Diaz", "Edwards", "Fischer", "Garcia", "Hughes", "Ito",
    "Jensen", "Khan", "Lopez", "Martin", "Nguyen", "Okafor", "Patel", "Quinn", "Reyes", "Silva", "Turner",
    "Usman", "Vasquez", "Walker", "Xu", "Young", "Zimmerman", "Brooks", "Chen", "Dubois", "Evans",
    "Foster", "Gupta", "Hansen", "Kim", "Larsen", "Murphy", "Novak", "Ortiz", "Park", "Rossi",
    "Schmidt", "Tanaka", "Wright", "Cohen", "Morales", "Singh", "Kowalski", "Ali", "Moreau", "Sato"]

const STREETS = ["Maple Ave", "Oak St", "Pine Rd", "Cedar Ln", "Elm St", "Birch Way", "Lakeview Dr", "Hillcrest Rd",
    "Sunset Blvd", "Park Ave", "River Rd", "Highland Ave", "Main St", "King St", "Queen St", "Church St",
    "Mill Rd", "Harbour St", "Station Rd", "Victoria Ave"]

/** [city, state, country, postcodes] */
const CITIES: [string, string, string, string[]][] = [
    ["New York", "NY", "US", ["10001", "10011", "10024"]],
    ["San Francisco", "CA", "US", ["94103", "94110", "94117"]],
    ["Los Angeles", "CA", "US", ["90012", "90026", "90049"]],
    ["Seattle", "WA", "US", ["98101", "98109", "98122"]],
    ["Austin", "TX", "US", ["73301", "78701", "78704"]],
    ["Chicago", "IL", "US", ["60601", "60614", "60622"]],
    ["Boston", "MA", "US", ["02108", "02116", "02134"]],
    ["Denver", "CO", "US", ["80202", "80203", "80211"]],
    ["Miami", "FL", "US", ["33101", "33130", "33139"]],
    ["Portland", "OR", "US", ["97201", "97209", "97214"]],
    ["Atlanta", "GA", "US", ["30303", "30308", "30318"]],
    ["Minneapolis", "MN", "US", ["55401", "55403", "55408"]],
    ["Toronto", "ON", "CA", ["M5V 2T6", "M4C 1B5", "M6G 3A1"]],
    ["Vancouver", "BC", "CA", ["V6B 1A1", "V5K 0A1", "V6K 2G8"]],
    ["Montreal", "QC", "CA", ["H2X 1Y4", "H3B 2Y5", "H2T 1S6"]],
    ["Calgary", "AB", "CA", ["T2P 1J9", "T3A 0E2", "T2T 4V1"]],
    ["London", "LDN", "UK", ["SW1A 1AA", "E1 6AN", "N1 9GU"]],
    ["Manchester", "MAN", "UK", ["M1 1AE", "M4 5JD", "M20 2RN"]],
    ["Edinburgh", "EDH", "UK", ["EH1 1YZ", "EH3 9DR", "EH8 9YL"]],
    ["Bristol", "BST", "UK", ["BS1 4DJ", "BS6 5BZ", "BS8 1TH"]]
]

/** Per category: nouns, modifiers and a [min, max] price range */
const CATALOG: Record<string, { nouns: string[]; mods: string[]; price: [number, number] }> = {
    c1: { nouns: ["Mouse", "Keyboard", "Trackpad", "Monitor Stand", "Laptop Sleeve", "Docking Station", "Wrist Rest", "Numeric Keypad"],
        mods: ["Wireless", "Ergonomic", "Compact", "Slim", "Silent", "Backlit", "Travel", "Vertical"], price: [12, 179] },
    c2: { nouns: ["Hoodie", "T-Shirt", "Rain Jacket", "Joggers", "Beanie", "Sneakers", "Backpack", "Polo Shirt"],
        mods: ["Cotton", "Classic", "Lightweight", "Organic", "Oversized", "Performance", "Fleece", "Vintage"], price: [15, 129] },
    c3: { nouns: ["Smartphone 128GB", "Smartphone 256GB", "Smartphone Mini", "Foldable Phone", "Rugged Phone", "Smartphone Plus"],
        mods: ["Aero", "Nova", "Zen", "Pulse", "Edge", "Vista", "Orbit", "Flux"], price: [199, 1299] },
    c4: { nouns: ["Laptop 13", "Laptop 15", "Ultrabook 14", "Chromebook", "Gaming Laptop 16", "2-in-1 Laptop"],
        mods: ["Aero", "Nova", "Zen", "Titan", "Edge", "Air", "Volt", "Prime"], price: [349, 2499] },
    c5: { nouns: ["Earbuds", "Over-Ear Headphones", "On-Ear Headphones", "Sport Earphones", "Studio Headphones"],
        mods: ["Wireless", "Noise Cancelling", "Bass Boost", "Studio", "Open-Back", "Kids", "Foldable", "Pro"], price: [19, 349] },
    c6: { nouns: ["Controller", "Gaming Chair", "Gaming Keyboard", "Gaming Mouse", "Capture Card", "Racing Wheel", "Headset Stand"],
        mods: ["RGB", "Pro", "Elite", "Tournament", "Wireless", "Compact", "Ultralight", "Hall Effect"], price: [19, 449] },
    c7: { nouns: ["Desk Lamp", "Monitor Arm", "Footrest", "Desk Organizer", "Office Chair", "Desk Converter", "Whiteboard"],
        mods: ["LED", "Adjustable", "Ergonomic", "Bamboo", "Minimalist", "Dual", "Mesh", "Walnut"], price: [15, 499] },
    c8: { nouns: ["Fitness Tracker", "Smartwatch", "Smart Ring", "Sleep Tracker", "Heart Rate Strap"],
        mods: ["Active", "Sport", "Classic", "Pro", "Lite", "Solar", "Trail", "Swim"], price: [29, 449] },
    c9: { nouns: ["Mirrorless Camera", "50mm Lens", "Ring Light", "Camera Bag", "Memory Card 128GB", "Gimbal Stabilizer", "Lens Filter Kit"],
        mods: ["Compact", "Pro", "Travel", "Studio", "Weatherproof", "Ultra", "Vlogger", "Creator"], price: [19, 1899] },
    c10: { nouns: ["Mesh WiFi System", "8-Port Switch", "WiFi Extender", "Powerline Adapter", "USB WiFi Adapter", "Patch Cable 2m"],
        mods: ["Gigabit", "Dual-Band", "Tri-Band", "Smart", "Compact", "Outdoor", "Managed", "WiFi 7"], price: [9, 399] },
    c11: { nouns: ["Portable SSD 2TB", "External HDD 4TB", "USB Flash Drive 64GB", "NAS Enclosure", "microSD Card 256GB", "NVMe SSD 1TB"],
        mods: ["Rugged", "Slim", "High-Speed", "Pocket", "Pro", "Secure", "Shockproof", "Mini"], price: [9, 599] },
    c12: { nouns: ["Charging Cable", "Power Bank", "65W Wall Charger", "Cable Organizer", "Tablet Stand", "Bluetooth Tracker", "Laptop Stand"],
        mods: ["Braided", "Fast", "Magnetic", "Foldable", "Travel", "Compact", "Aluminum", "Dual"], price: [7, 89] }
}

const REVIEW_COMMENTS: Record<number, string[]> = {
    5: ["Absolutely love it.", "Exceeded my expectations.", "Best purchase this year.", "Works perfectly, highly recommend.",
        "Great quality for the price.", "Would buy again.", "Exactly as described."],
    4: ["Very good, a few minor quibbles.", "Solid product overall.", "Does the job well.", "Good value and fast shipping.",
        "Happy with it so far.", "Nice build quality."],
    3: ["It's okay, nothing special.", "Average quality.", "Works, but could be better.", "Decent for the price.",
        "Mixed feelings about this one."],
    2: ["Not great, had some issues.", "Below my expectations.", "Feels cheaply made.", "Stopped working properly after a few weeks."],
    1: ["Very disappointed.", "Broke after a week.", "Would not recommend.", "Did not work out of the box."]
}

const COUPON_WORDS = ["SAVE", "AUTUMN", "WINTER", "CYBER", "STUDENT", "LOYALTY", "WEEKEND", "BUNDLE", "HOLIDAY",
    "FALL", "SNOW", "THANKS", "SPRINGSALE", "BACK2SCHOOL", "MEMBER"]

const ORG_PREFIX = ["Bright", "Cloud", "Data", "Pixel", "Nova", "Swift", "Quantum", "Iron", "Silver", "Green", "Bold",
    "Atlas", "Echo", "Lumen", "Vertex", "North", "Peak", "Cedar", "Harbor", "Signal", "Ember", "Hyper", "Clear", "Prism"]
const ORG_SUFFIX = ["Labs", "Works", "Stack", "Systems", "Studio", "Analytics", "Apps", "Digital", "Logic", "Forge", "Hub", "Ops"]

const PROJECT_NAMES = ["Website Redesign", "Mobile App", "Analytics Dashboard", "Customer Portal", "Billing Revamp",
    "Onboarding Flow", "Admin Panel", "Public API v2", "Search Improvements", "Notification Service", "Design System",
    "Marketing Site", "Data Warehouse", "Payment Integration", "Localization", "Performance Audit", "Accessibility Audit",
    "Help Center", "Referral Program", "Mobile Checkout", "Inventory Sync", "Reporting Suite", "Single Sign-On",
    "Partner API", "Support Chat Widget", "Email Templates", "Pricing Page", "Security Hardening", "Feature Flags",
    "Usage Metering"]

const TASK_VERBS = ["Design", "Implement", "Review", "Test", "Document", "Refactor", "Fix bugs in", "Set up", "Plan", "Optimize"]
const TASK_OBJECTS = ["login page", "signup flow", "pricing table", "API endpoints", "database schema", "CI pipeline",
    "error handling", "unit tests", "onboarding emails", "dashboard charts", "search filters", "user settings",
    "payment webhook", "release notes", "caching layer", "mobile layout", "dark mode", "analytics events",
    "access control", "file uploads"]

const PLAN_PRICE: Record<string, number> = { starter: 19, pro: 49, business: 99 }

// ---------------------------------------------------------------------------------------------
// Generators (dependency order)
// ---------------------------------------------------------------------------------------------

export const generate = (kept: Datasets): Datasets => {
    const out = Object.fromEntries(Object.entries(kept).map(([k, v]) => [k, [...v]])) as Datasets

    // Users ------------------------------------------------------------------------------------
    {
        const rnd = new Random("users")
        const nextId = idMaker(out.users, "u")
        const emails = new Set(out.users.map(u => u.email))
        const dates = rnd.timeline(WINDOW_START, Date.parse("2026-09-30T00:00:00Z"), TARGET.users - out.users.length)
        for (const date of dates) {
            const id = nextId()
            const gender = rnd.chance(0.5) ? "male" : "female"
            const first = rnd.pick(gender === "male" ? MALE_FIRST : FEMALE_FIRST)
            const last = rnd.pick(LAST_NAMES)
            const base = `${first}.${last}`.toLowerCase()
            const email = emails.has(`${base}@example.com`) ? `${base}${idNumber(id)}@example.com` : `${base}@example.com`
            emails.add(email)
            const [city, state, country, postcodes] = rnd.pick(CITIES)
            out.users.push({
                id,
                name: { first, last },
                gender,
                email,
                role: rnd.chance(0.08) ? "admin" : "customer",
                createdAt: iso(date),
                address: { street: `${rnd.int(1, 9999)} ${rnd.pick(STREETS)}`, city, state, country, postcode: rnd.pick(postcodes) },
                profile: { avatar: `https://randomuser.me/api/portraits/${gender === "male" ? "men" : "women"}/${idNumber(id) % 100}.jpg` }
            })
        }
    }
    const customers = out.users.filter(u => u.role === "customer")
    const createdBy = (records: Rec[], ms: number) => records.filter(r => ts(r.createdAt) <= ms)

    // Products ---------------------------------------------------------------------------------
    {
        const rnd = new Random("products")
        const nextId = idMaker(out.products, "p")
        const names = new Set(out.products.map(p => p.name))
        const categoryIds = out.categories.map(c => c.id)
        const dates = rnd.timeline(WINDOW_START, Date.parse("2026-09-30T00:00:00Z"), TARGET.products - out.products.length)
        for (const date of dates) {
            const categoryId = rnd.pick(categoryIds)
            const { nouns, mods, price: [min, max] } = CATALOG[categoryId]
            const name = uniqueName(rnd, names, () => `${rnd.pick(mods)} ${rnd.pick(nouns)}`)
            // Log-uniform so cheap items are as common as expensive ones, ending in .99
            const raw = Math.exp(Math.log(min) + rnd.next() * (Math.log(max) - Math.log(min)))
            out.products.push({ id: nextId(), name, price: round2(Math.floor(raw) + 0.99), categoryId, createdAt: iso(date) })
        }
    }

    // Coupons ----------------------------------------------------------------------------------
    {
        const rnd = new Random("coupons")
        const nextId = idMaker(out.coupons, "cp")
        const codes = new Set(out.coupons.map(c => c.code))
        while (out.coupons.length < TARGET.coupons) {
            const discount = rnd.pick([5, 10, 15, 20, 25, 30])
            const code = uniqueName(rnd, codes, () => `${rnd.pick(COUPON_WORDS)}${discount}`)
            const validTill = midnight(Date.parse("2026-11-30T00:00:00Z") + rnd.int(0, 210) * DAY) + DAY - 1000
            out.coupons.push({ id: nextId(), code, discount, validTill: iso(validTill) })
        }
    }

    // Reviews (numeric ids, no dates) ----------------------------------------------------------
    {
        const rnd = new Random("reviews")
        let nextId = Math.max(...out.reviews.map(r => r.id))
        const pairs = new Set(out.reviews.map(r => `${r.userId}/${r.productId}`))
        while (out.reviews.length < TARGET.reviews) {
            const productId = rnd.pick(out.products).id
            const userId = rnd.pick(customers).id
            if (pairs.has(`${userId}/${productId}`)) continue
            pairs.add(`${userId}/${productId}`)
            const rating = rnd.weighted([[5, 40], [4, 30], [3, 15], [2, 8], [1, 7]] as const)
            out.reviews.push({ id: ++nextId, productId, userId, rating, comment: rnd.pick(REVIEW_COMMENTS[rating]) })
        }
    }

    // Orders: total = sum of price × quantity (same rule as the hand-written orders) -------------
    {
        const rnd = new Random("orders")
        const nextId = idMaker(out.orders, "o")
        const price = new Map(out.products.map(p => [p.id, p.price]))
        const dates = rnd.timeline(WINDOW_START, NOW - 60000, TARGET.orders - out.orders.length)
        for (const date of dates) {
            const buyers = createdBy(customers, date)
            const available = createdBy(out.products, date)
            const count = rnd.weighted([[1, 50], [2, 30], [3, 15], [4, 5]] as const)
            const products = rnd.sample(available, count).map(p => ({
                productId: p.id,
                quantity: rnd.weighted([[1, 70], [2, 22], [3, 8]] as const)
            }))
            const total = round2(products.reduce((sum, item) => sum + price.get(item.productId)! * item.quantity, 0))
            const validCoupons = out.coupons.filter(c => ts(c.validTill) >= date)
            const couponId = validCoupons.length > 0 && rnd.chance(0.25) ? rnd.pick(validCoupons).id : undefined
            out.orders.push({
                id: nextId(),
                userId: rnd.pick(buyers).id,
                products,
                total,
                ...(couponId ? { couponId } : {}),
                createdAt: iso(date)
            })
        }
    }

    // Cart: at most one per customer ------------------------------------------------------------
    {
        const rnd = new Random("cart")
        const nextId = idMaker(out.cart, "cart")
        const withCart = new Set(out.cart.map(c => c.userId))
        const candidates = rnd.sample(customers.filter(u => !withCart.has(u.id)), TARGET.cart - out.cart.length)
            .sort((a, b) => idNumber(a.id) - idNumber(b.id))
        for (const user of candidates) {
            const items = rnd.sample(out.products, rnd.int(1, 3)).map(p => ({ productId: p.id, quantity: rnd.weighted([[1, 80], [2, 20]] as const) }))
            out.cart.push({ id: nextId(), userId: user.id, items })
        }
    }

    // Organizations: each owner owns one --------------------------------------------------------
    {
        const rnd = new Random("organizations")
        const nextId = idMaker(out.organizations, "org")
        const names = new Set(out.organizations.map(o => o.name))
        const owners = new Set(out.organizations.map(o => o.ownerId))
        const dates = rnd.timeline(WINDOW_START, Date.parse("2026-10-20T00:00:00Z"), TARGET.organizations - out.organizations.length)
        for (const date of dates) {
            const name = uniqueName(rnd, names, () => {
                const [prefix, suffix] = [rnd.pick(ORG_PREFIX), rnd.pick(ORG_SUFFIX)]
                return rnd.chance(0.5) ? `${prefix}${suffix}` : `${prefix} ${suffix}`
            })
            const owner = rnd.pick(createdBy(out.users, date).filter(u => !owners.has(u.id)))
            owners.add(owner.id)
            const plan = rnd.weighted([["starter", 40], ["pro", 40], ["business", 20]] as const)
            out.organizations.push({ id: nextId(), name, ownerId: owner.id, plan, createdAt: iso(date) })
        }
    }

    // Subscriptions: one per organization, matching its plan ------------------------------------
    {
        const rnd = new Random("subscriptions")
        const nextId = idMaker(out.subscriptions, "sub")
        const subscribed = new Set(out.subscriptions.map(s => s.organizationId))
        for (const org of out.organizations.filter(o => !subscribed.has(o.id))) {
            const startedAt = midnight(ts(org.createdAt)) + rnd.int(0, 3) * DAY
            const billingCycle = rnd.chance(0.75) ? "monthly" : "yearly"
            // Trials last 30 days, and only monthly plans can be past due (they have been billed)
            const recent = startedAt >= NOW - 30 * DAY
            let status = rnd.weighted([["active", 70], ["trialing", 10], ["past_due", 8], ["canceled", 12]] as const)
            if (recent) status = rnd.chance(0.6) ? "trialing" : "active"
            else if (status === "trialing" || (status === "past_due" && billingCycle === "yearly")) status = "active"
            out.subscriptions.push({
                id: nextId(),
                organizationId: org.id,
                plan: org.plan,
                status,
                billingCycle,
                price: PLAN_PRICE[org.plan] * (billingCycle === "yearly" ? 10 : 1),
                startedAt: iso(startedAt)
            })
        }
    }

    // Invoices: one per billing cycle since the subscription started ----------------------------
    {
        const rnd = new Random("invoices")
        const nextId = idMaker(out.invoices, "inv")
        const existing = new Set(out.invoices.map(i => `${i.subscriptionId}/${i.issuedAt.slice(0, 10)}`))
        const generated: Rec[] = []
        for (const sub of out.subscriptions) {
            if (sub.status === "trialing") continue
            const months = sub.billingCycle === "yearly" ? 12 : 1
            const issueDates: number[] = []
            for (let k = 1; addMonths(ts(sub.startedAt), k * months) <= NOW; k++) issueDates.push(addMonths(ts(sub.startedAt), k * months))
            // Canceled subscriptions stopped billing at some point
            const billed = sub.status === "canceled" ? issueDates.slice(0, rnd.int(1, Math.max(1, issueDates.length))) : issueDates
            billed.forEach((issued, index) => {
                if (existing.has(`${sub.id}/${iso(issued).slice(0, 10)}`)) return
                const due = issued + 5 * DAY
                const isLast = index === billed.length - 1
                const status = !isLast ? "paid" : sub.status === "past_due" ? "overdue" : due >= NOW ? "open" : "paid"
                generated.push({
                    organizationId: sub.organizationId,
                    subscriptionId: sub.id,
                    amount: sub.price,
                    status,
                    issuedAt: iso(issued),
                    dueAt: iso(due)
                })
            })
        }
        generated.sort((a, b) => ts(a.issuedAt) - ts(b.issuedAt) || idNumber(a.subscriptionId) - idNumber(b.subscriptionId))
        for (const invoice of generated) out.invoices.push({ id: nextId(), ...invoice })
    }

    // Projects ---------------------------------------------------------------------------------
    {
        const rnd = new Random("projects")
        const nextId = idMaker(out.projects, "proj")
        const namesByOrg = new Map<string, Set<string>>()
        for (const p of out.projects) {
            if (!namesByOrg.has(p.organizationId)) namesByOrg.set(p.organizationId, new Set())
            namesByOrg.get(p.organizationId)!.add(p.name)
        }
        const dates = rnd.timeline(Date.parse("2026-03-20T00:00:00Z"), Date.parse("2026-10-15T00:00:00Z"), TARGET.projects - out.projects.length)
        for (const date of dates) {
            const org = rnd.pick(createdBy(out.organizations, date).filter(o => (namesByOrg.get(o.id)?.size ?? 0) < PROJECT_NAMES.length))
            if (!namesByOrg.has(org.id)) namesByOrg.set(org.id, new Set())
            const name = uniqueName(rnd, namesByOrg.get(org.id)!, () => rnd.pick(PROJECT_NAMES))
            out.projects.push({
                id: nextId(),
                name,
                organizationId: org.id,
                ownerId: rnd.pick(createdBy(out.users, date)).id,
                status: rnd.weighted([["active", 55], ["planning", 20], ["completed", 25]] as const),
                createdAt: iso(date)
            })
        }
    }

    // Tasks: due after their project starts; status follows the project ------------------------
    {
        const rnd = new Random("tasks")
        const nextId = idMaker(out.tasks, "task")
        while (out.tasks.length < TARGET.tasks) {
            const project = rnd.pick(out.projects)
            const due = midnight(ts(project.createdAt)) + rnd.int(3, 60) * DAY
            const status = project.status === "completed" ? "done"
                : project.status === "planning" ? rnd.weighted([["todo", 85], ["in_progress", 15]] as const)
                : rnd.weighted([["todo", 35], ["in_progress", 30], ["done", 35]] as const)
            out.tasks.push({
                id: nextId(),
                projectId: project.id,
                assigneeId: rnd.pick(createdBy(out.users, ts(project.createdAt))).id,
                title: `${rnd.pick(TASK_VERBS)} ${rnd.pick(TASK_OBJECTS)}`,
                status,
                priority: rnd.weighted([["low", 30], ["medium", 45], ["high", 25]] as const),
                dueDate: iso(due)
            })
        }
    }

    // Notifications: generated from real tasks, invoices and projects --------------------------
    {
        const rnd = new Random("notifications")
        const nextId = idMaker(out.notifications, "n")
        const ownerOf = new Map(out.organizations.map(o => [o.id, o.ownerId]))
        const candidates: Rec[] = []
        for (const task of out.tasks.slice(KEEP.tasks)) {
            candidates.push({ userId: task.assigneeId, type: "task_assigned", message: `You were assigned to "${task.title}"`,
                at: ts(task.dueDate) - rnd.int(3, 14) * DAY + rnd.int(8 * 60, 18 * 60) * 60000 })
        }
        for (const invoice of out.invoices.slice(KEEP.invoices)) {
            const userId = ownerOf.get(invoice.organizationId)
            if (invoice.status === "paid") {
                candidates.push({ userId, type: "invoice_paid", message: `Invoice ${invoice.id} was successfully paid`,
                    at: ts(invoice.issuedAt) + rnd.int(1, 4) * DAY + rnd.int(8 * 60, 18 * 60) * 60000 })
            } else if (invoice.status === "overdue") {
                candidates.push({ userId, type: "invoice_overdue", message: `Invoice ${invoice.id} is overdue`, at: ts(invoice.dueAt) + DAY })
            }
        }
        for (const project of out.projects.slice(KEEP.projects).filter(p => p.status === "completed")) {
            candidates.push({ userId: project.ownerId, type: "project_completed", message: `Project "${project.name}" was marked as completed`,
                at: ts(project.createdAt) + rnd.int(20, 90) * DAY })
        }
        // Keep every invoice/project event (they are rarer), then fill up with task assignments
        const inWindow = candidates.filter(c => c.at >= WINDOW_START && c.at < NOW)
        const needed = TARGET.notifications - out.notifications.length
        const rare = inWindow.filter(c => c.type !== "task_assigned")
        const keptRare = rnd.sample(rare, Math.min(rare.length, Math.floor(needed / 2)))
        const tasks = rnd.sample(inWindow.filter(c => c.type === "task_assigned"), needed - keptRare.length)
        const chosen = [...keptRare, ...tasks].sort((a, b) => a.at - b.at)
        for (const { userId, type, message, at } of chosen) {
            const read = rnd.chance(at < NOW - 14 * DAY ? 0.85 : 0.3)
            out.notifications.push({ id: nextId(), userId, type, message, read, createdAt: iso(Math.floor(at / 60000) * 60000) })
        }
    }

    return out
}

// ---------------------------------------------------------------------------------------------
// File I/O
// ---------------------------------------------------------------------------------------------

/** Compact JSON with spaces, matching the hand-written files: { "id": "c1", "name": "Clothing" } */
const inline = (value: unknown): string => {
    if (Array.isArray(value)) return `[${value.map(inline).join(", ")}]`
    if (value && typeof value === "object") {
        const entries = Object.entries(value)
        return entries.length === 0 ? "{}" : `{ ${entries.map(([k, v]) => `${JSON.stringify(k)}: ${inline(v)}`).join(", ")} }`
    }
    return JSON.stringify(value)
}

/** One record per line */
export const format = (records: Rec[]) => `[\n${records.map(r => `    ${inline(r)}`).join(",\n")}\n]\n`

export const readDatasets = (): Datasets =>
    Object.fromEntries(Object.entries(FILES).map(([name, file]) =>
        [name, JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"))]
    )) as Datasets

export const keptRecords = (current: Datasets): Datasets =>
    Object.fromEntries(Object.entries(current).map(([name, records]) => {
        const keep = KEEP[name as EntityName]
        if (records.length < keep) throw new Error(`${name}: expected at least ${keep} hand-written records, found ${records.length}`)
        return [name, records.slice(0, keep)]
    })) as Datasets

if (require.main === module) {
    const current = readDatasets()
    const generated = generate(keptRecords(current))
    const check = process.argv.includes("--check")
    let stale = 0

    for (const [name, file] of Object.entries(FILES)) {
        const records = generated[name as EntityName]
        const upToDate = JSON.stringify(records) === JSON.stringify(current[name as EntityName])
        if (check) {
            if (!upToDate) {
                stale++
                console.error(`${file} is out of date`)
            }
        } else {
            fs.writeFileSync(path.join(DATA_DIR, file), format(records))
            console.log(`${file.padEnd(34)} ${records.length} records`)
        }
    }

    if (check && stale > 0) {
        console.error("Run `npm run generate:data` and commit the result.")
        process.exit(1)
    }
}
