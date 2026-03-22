# Only seed the demo user — never wipe existing accounts
demo = User.find_by(email: "demo@finance.app")

if demo
  puts "Demo user already exists, skipping seed."
  exit
end

demo = User.create!(
  name: "Demo User",
  email: "demo@finance.app",
  password: "demo1234",
  is_demo: true
)

# Transactions (all scoped to demo user)
demo.transactions.create!([
  { name: "Emma Richardson", amount: 75.50, category: "General", date: "2024-08-19", avatar: "emma-richardson.jpg", recurring: false },
  { name: "Savory Bites Bistro", amount: -55.50, category: "Dining Out", date: "2024-08-19", avatar: "savory-bites-bistro.jpg", recurring: false },
  { name: "Daniel Carter", amount: -42.30, category: "General", date: "2024-08-18", avatar: "daniel-carter.jpg", recurring: false },
  { name: "Sun Park", amount: 120.00, category: "General", date: "2024-08-17", avatar: "sun-park.jpg", recurring: false },
  { name: "Urban Services Hub", amount: -65.00, category: "General", date: "2024-08-17", avatar: "urban-services-hub.jpg", recurring: false },
  { name: "Liam Hughes", amount: 65.75, category: "Groceries", date: "2024-08-15", avatar: "liam-hughes.jpg", recurring: false },
  { name: "Lily Ramirez", amount: 50.00, category: "General", date: "2024-08-14", avatar: "lily-ramirez.jpg", recurring: false },
  { name: "Ethan Clark", amount: -32.50, category: "Dining Out", date: "2024-08-13", avatar: "ethan-clark.jpg", recurring: false },
  { name: "James Thompson", amount: -5.00, category: "Entertainment", date: "2024-08-11", avatar: "james-thompson.jpg", recurring: false },
  { name: "Pixel Playground", amount: -10.00, category: "Entertainment", date: "2024-08-11", avatar: "pixel-playground.jpg", recurring: true },
  { name: "Ella Phillips", amount: -45.00, category: "Dining Out", date: "2024-08-10", avatar: "ella-phillips.jpg", recurring: false },
  { name: "Sofia Peterson", amount: -15.00, category: "Transportation", date: "2024-08-08", avatar: "sofia-peterson.jpg", recurring: false },
  { name: "Mason Martinez", amount: -35.25, category: "Lifestyle", date: "2024-08-07", avatar: "mason-martinez.jpg", recurring: false },
  { name: "Green Plate Eatery", amount: -78.50, category: "Groceries", date: "2024-08-06", avatar: "green-plate-eatery.jpg", recurring: false },
  { name: "Sebastian Cook", amount: -22.50, category: "Transportation", date: "2024-08-06", avatar: "sebastian-cook.jpg", recurring: false },
  { name: "William Harris", amount: -10.00, category: "Personal Care", date: "2024-08-05", avatar: "william-harris.jpg", recurring: false },
  { name: "Elevate Education", amount: -50.00, category: "Education", date: "2024-08-04", avatar: "elevate-education.jpg", recurring: true },
  { name: "Serenity Spa & Wellness", amount: -30.00, category: "Personal Care", date: "2024-08-03", avatar: "serenity-spa-and-wellness.jpg", recurring: true },
  { name: "Spark Electric Solutions", amount: -100.00, category: "Bills", date: "2024-08-02", avatar: "spark-electric-solutions.jpg", recurring: true },
  { name: "Rina Sato", amount: -50.00, category: "Bills", date: "2024-08-02", avatar: "rina-sato.jpg", recurring: false },
  { name: "Swift Ride Share", amount: -18.75, category: "Transportation", date: "2024-08-01", avatar: "swift-ride-share.jpg", recurring: false },
  { name: "Aqua Flow Utilities", amount: -100.00, category: "Bills", date: "2024-07-30", avatar: "aqua-flow-utilities.jpg", recurring: true },
  { name: "EcoFuel Energy", amount: -35.00, category: "Bills", date: "2024-07-29", avatar: "ecofuel-energy.jpg", recurring: true },
  { name: "Yuna Kim", amount: -28.50, category: "Dining Out", date: "2024-07-29", avatar: "yuna-kim.jpg", recurring: false },
  { name: "Flavor Fiesta", amount: -42.75, category: "Dining Out", date: "2024-07-27", avatar: "flavor-fiesta.jpg", recurring: false },
  { name: "Harper Edwards", amount: -89.99, category: "Shopping", date: "2024-07-26", avatar: "harper-edwards.jpg", recurring: false },
  { name: "Buzz Marketing Group", amount: 3358.00, category: "General", date: "2024-07-26", avatar: "buzz-marketing-group.jpg", recurring: false },
  { name: "TechNova Innovations", amount: -29.99, category: "Shopping", date: "2024-07-25", avatar: "technova-innovations.jpg", recurring: false },
  { name: "ByteWise", amount: -49.99, category: "Lifestyle", date: "2024-07-23", avatar: "bytewise.jpg", recurring: true },
  { name: "Nimbus Data Storage", amount: -9.99, category: "Bills", date: "2024-07-21", avatar: "nimbus-data-storage.jpg", recurring: true },
  { name: "Emma Richardson", amount: -25.00, category: "General", date: "2024-07-20", avatar: "emma-richardson.jpg", recurring: false },
  { name: "Daniel Carter", amount: 50.00, category: "General", date: "2024-07-19", avatar: "daniel-carter.jpg", recurring: false },
  { name: "Sun Park", amount: -38.50, category: "General", date: "2024-07-18", avatar: "sun-park.jpg", recurring: false },
  { name: "Harper Edwards", amount: -29.99, category: "Shopping", date: "2024-07-17", avatar: "harper-edwards.jpg", recurring: false },
  { name: "Liam Hughes", amount: -52.75, category: "Groceries", date: "2024-07-16", avatar: "liam-hughes.jpg", recurring: false },
  { name: "Lily Ramirez", amount: 75.00, category: "General", date: "2024-07-15", avatar: "lily-ramirez.jpg", recurring: false },
  { name: "Ethan Clark", amount: -41.25, category: "Dining Out", date: "2024-07-14", avatar: "ethan-clark.jpg", recurring: false },
  { name: "Rina Sato", amount: -10.00, category: "Entertainment", date: "2024-07-13", avatar: "rina-sato.jpg", recurring: false },
  { name: "James Thompson", amount: -95.50, category: "Bills", date: "2024-07-12", avatar: "james-thompson.jpg", recurring: false },
  { name: "Ella Phillips", amount: -33.75, category: "Dining Out", date: "2024-07-11", avatar: "ella-phillips.jpg", recurring: false },
  { name: "Yuna Kim", amount: -27.50, category: "Dining Out", date: "2024-07-10", avatar: "yuna-kim.jpg", recurring: false },
  { name: "Sofia Peterson", amount: -12.50, category: "Transportation", date: "2024-07-09", avatar: "sofia-peterson.jpg", recurring: false },
  { name: "Mason Martinez", amount: -65.00, category: "Lifestyle", date: "2024-07-08", avatar: "mason-martinez.jpg", recurring: false },
  { name: "Sebastian Cook", amount: -20.00, category: "Transportation", date: "2024-07-07", avatar: "sebastian-cook.jpg", recurring: false },
  { name: "William Harris", amount: 20.00, category: "General", date: "2024-07-06", avatar: "william-harris.jpg", recurring: false },
  { name: "Elevate Education", amount: -50.00, category: "Education", date: "2024-07-05", avatar: "elevate-education.jpg", recurring: true },
  { name: "Serenity Spa & Wellness", amount: -30.00, category: "Personal Care", date: "2024-07-03", avatar: "serenity-spa-and-wellness.jpg", recurring: true },
  { name: "Spark Electric Solutions", amount: -100.00, category: "Bills", date: "2024-07-02", avatar: "spark-electric-solutions.jpg", recurring: true },
  { name: "Swift Ride Share", amount: -16.50, category: "Transportation", date: "2024-07-02", avatar: "swift-ride-share.jpg", recurring: false }
])

# Budgets (scoped to demo user)
demo.budgets.create!([
  { category: "Entertainment", max_amount: 50.00, theme_color: "#277C78" },
  { category: "Bills", max_amount: 750.00, theme_color: "#82C9D7" },
  { category: "Dining Out", max_amount: 75.00, theme_color: "#F2CDAC" },
  { category: "Personal Care", max_amount: 100.00, theme_color: "#626070" }
])

# Pots (scoped to demo user)
demo.pots.create!([
  { name: "Savings", target_amount: 2000.00, saved_amount: 159.00, theme_color: "#277C78" },
  { name: "Concert Ticket", target_amount: 150.00, saved_amount: 110.00, theme_color: "#626070" },
  { name: "Gift", target_amount: 150.00, saved_amount: 40.00, theme_color: "#82C9D7" },
  { name: "New Laptop", target_amount: 1000.00, saved_amount: 10.00, theme_color: "#F2CDAC" }
])

puts "Seeded demo user: demo@finance.app / demo1234"
puts "Demo user has #{demo.transactions.count} transactions, #{demo.budgets.count} budgets, #{demo.pots.count} pots"
