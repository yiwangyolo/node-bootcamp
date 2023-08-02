const Review = require('../models/reviewModel');
const AppError = require('../utils/appError');

// getting all reviews
exports.getAllReviews = async (req, res, next) => {
  try {
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews,
      },
    });
  } catch (err) {
    next(err);
  }
};

// create new review
exports.createReview = async (req, res, next) => {
  try {
    if (!req.body.tour) req.body.tour = req.param.tourId;
    if (!req.body.user) req.body.user = req.user.id;

    const newReview = await Review.create(req.body);

    if (!newReview) {
      throw new AppError('Not able to create a new review.', 400);
    }

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview,
      },
    });
  } catch (err) {
    next(err);
  }
};
