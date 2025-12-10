import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { Borrow } from "../models/borrowModel.js";
import { BooK } from "../models/bookModel.js";
import { User } from "../models/userModel.js";


export const recordBorrowedBook = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { email } = req.body || {};

  const book = await BooK.findById(id);
  if (!book) return next(new ErrorHandler("Book not found", 404));

  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found", 404));

  if (book.quantity === 0) {
    return next(new ErrorHandler("Book not available", 400));
  }

  const alreadyBorrowed = user.borrowedBooks.find(
    (b) => b.bookId.toString() === id && !b.returned
  );

  if (alreadyBorrowed) {
    return next(new ErrorHandler("Book already borrowed", 400));
  }

  book.quantity -= 1;
  book.availability = book.quantity > 0;
  await book.save();

  const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  user.borrowedBooks.push({
    bookId: book._id,
    bookTitle: book.title,
    borrowedDate: new Date(),
    dueDate
  });

  await user.save();

 
  await Borrow.create({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    book: {
      id: book._id,
      price: book.price,
    },
    borrowDate: new Date(),
    dueDate,
    fine: 0,
    notified: false
  });

  return res.status(200).json({
    success: true,
    message: "Borrowed book recorded successfully.",
  });
});


export const borrowedBooks = catchAsyncErrors(async (req, res, next) => {});

export const getBorrowedBookAdmin = catchAsyncErrors(
  async (req, res, next) => {}
);
export const returnBorrowedBook = catchAsyncErrors(
  async (req, res, next) => {}
);
