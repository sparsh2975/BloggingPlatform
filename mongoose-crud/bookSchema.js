import mongoose from "mongoose";

/**
 * Book Schema Definition
 * Fields: title, author, genre, publishedYear, price, inStock
 */
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    genre: {
      type: String,
      enum: ["Fiction", "Non-Fiction", "Science", "History", "Fantasy", "Biography", "Other"],
      default: "Other",
    },
    publishedYear: {
      type: Number,
      min: [1000, "Year must be valid"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

const Book = mongoose.model("Book", bookSchema);

export default Book;
