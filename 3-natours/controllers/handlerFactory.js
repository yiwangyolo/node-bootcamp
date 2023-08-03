const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      throw new AppError('No tour found with that ID', 404);
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      throw new AppError('No tour found with that ID', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createOne = (Model) => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);

    if (!doc) {
      throw new AppError('Not able to create a new tour.', 400);
    }

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOne = (Model, popOptions) => async (req, res, next) => {
  try {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;

    if (!doc) {
      throw new AppError('No document found with that ID', 404);
    }

    res.status(200).json({
      status: 'sucess',
      requestedAt: req.requestTime,
      data: {
        data: doc,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getAll = (Model) => async (req, res, next) => {
  try {
    // to allow nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const doc = await features.query;

    res.status(200).json({
      status: 'sucess',
      requestedAt: req.requestTime,
      results: doc.length,
      data: {
        data: doc,
      },
    });
  } catch (err) {
    next(err);
  }
};
