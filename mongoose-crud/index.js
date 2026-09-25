import mongoose from "mongoose";
import Book from "./bookSchema.js";

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/bookstore";

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅  Connected to MongoDB:", mongoose.connection.name);
  } catch (err) {
    console.error("❌  MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

// ─── CREATE ───────────────────────────────────────────────────────────────────
async function createBooks() {
  console.log("\n── CREATE ─────────────────────────────────────────");

  const books = await Book.insertMany([
    {
      title: "The Pragmatic Programmer",
      author: "David Thomas",
      genre: "Non-Fiction",
      publishedYear: 1999,
      price: 45.99,
      inStock: true,
    },
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      genre: "Non-Fiction",
      publishedYear: 2008,
      price: 39.99,
      inStock: true,
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      genre: "Fantasy",
      publishedYear: 1937,
      price: 14.99,
      inStock: false,
    },
    {
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      genre: "Science",
      publishedYear: 1988,
      price: 19.99,
      inStock: true,
    },
  ]);

  console.log(`✅  Inserted ${books.length} books:`);
  books.forEach((b) => console.log(`   • [${b._id}] ${b.title} by ${b.author}`));
  return books;
}

// ─── READ ─────────────────────────────────────────────────────────────────────
async function readBooks() {
  console.log("\n── READ ───────────────────────────────────────────");

  // 1. Find all books
  const all = await Book.find().select("title author genre price inStock");
  console.log(`\n📚  All books (${all.length} total):`);
  all.forEach((b) =>
    console.log(
      `   • ${b.title} | ${b.author} | ${b.genre} | $${b.price} | ${b.inStock ? "In Stock" : "Out of Stock"}`
    )
  );

  // 2. Find books in stock with price < 25
  const affordable = await Book.find({ inStock: true, price: { $lt: 25 } }).sort({ price: 1 });
  console.log(`\n💰  In-stock books under $25 (${affordable.length}):`);
  affordable.forEach((b) => console.log(`   • ${b.title} — $${b.price}`));

  // 3. Find a single book by title (case-insensitive regex)
  const one = await Book.findOne({ title: /clean code/i });
  console.log(`\n🔍  Found single book: ${one ? one.title : "Not found"}`);
}

// ─── UPDATE ───────────────────────────────────────────────────────────────────
async function updateBooks() {
  console.log("\n── UPDATE ─────────────────────────────────────────");

  // 1. Update a single document — mark "The Hobbit" as in stock
  const updateOne = await Book.findOneAndUpdate(
    { title: "The Hobbit" },
    { $set: { inStock: true, price: 12.99 } },
    { new: true } // return the updated document
  );
  console.log(
    `\n✏️   Updated "${updateOne?.title}": inStock=${updateOne?.inStock}, price=$${updateOne?.price}`
  );

  // 2. Bulk update — apply a 10% price increase to all Non-Fiction books
  const bulkResult = await Book.updateMany(
    { genre: "Non-Fiction" },
    { $mul: { price: 1.1 } }
  );
  console.log(`\n📈  Bulk price +10% on Non-Fiction: ${bulkResult.modifiedCount} books updated`);

  // 3. Verify the updated prices
  const nonFiction = await Book.find({ genre: "Non-Fiction" }).select("title price");
  nonFiction.forEach((b) =>
    console.log(`   • ${b.title}: $${b.price.toFixed(2)}`)
  );
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
async function deleteBooks() {
  console.log("\n── DELETE ─────────────────────────────────────────");

  // 1. Delete a single book by title
  const deleted = await Book.findOneAndDelete({ title: "Clean Code" });
  console.log(`\n🗑️   Deleted single book: "${deleted?.title}"`);

  // 2. Delete all books published before 1990
  const { deletedCount } = await Book.deleteMany({ publishedYear: { $lt: 1990 } });
  console.log(`🗑️   Deleted ${deletedCount} book(s) published before 1990`);

  // 3. Show remaining books
  const remaining = await Book.find().select("title publishedYear");
  console.log(`\n📖  Remaining books (${remaining.length}):`);
  remaining.forEach((b) => console.log(`   • ${b.title} (${b.publishedYear})`));
}

// ─── Main Runner ──────────────────────────────────────────────────────────────
async function main() {
  await connectDB();

  // Clear collection so demo is idempotent on every run
  await Book.deleteMany({});
  console.log("🧹  Cleared existing books collection");

  await createBooks();
  await readBooks();
  await updateBooks();
  await deleteBooks();

  await mongoose.disconnect();
  console.log("\n🔌  Disconnected from MongoDB. Done!");
}

main().catch((err) => {
  console.error("Unhandled error:", err);
  mongoose.disconnect();
  process.exit(1);
});
