class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  filterTable() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);

    if (queryObj.filter) {
      this.query = this.query.find({
        $or: [
          { name: queryObj.filter.toUpperCase() },
          { lastname: queryObj.filter.toUpperCase() },
          { email: { $regex: queryObj.filter.toLowerCase() } }
        ]
      });
    }

    return this;
  }

  filterTableMaterials(companyIdIn) {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    if (queryObj.filter) {
      this.query = this.query.find({
        companyId: companyIdIn,
        $or: [
          { materialId: { $regex: queryObj.filter } },
          { name: { $regex: queryObj.filter } },
          { baseUnitMeasure: { $regex: queryObj.filter.toUpperCase() } },
          { productCategory: { $regex: queryObj.filter.toUpperCase() } },
          { type: { $regex: queryObj.filter } },
          { createdAt: { $regex: queryObj.filter.toUpperCase() } },
          { modifiedAt: { $regex: queryObj.filter.toUpperCase() } }
        ]
      });
    } else {
      this.query = this.query.find({
        companyId: companyIdIn
      });
    }
    return this;
  }

  filterTableServices(companyIdIn) {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObj[el]);
    if (queryObj.filter) {
      this.query = this.query.find({
        $or: [
          { serviceId: { $regex: queryObj.filter } },
          { name: { $regex: queryObj.filter } },
          { baseUnitMeasure: { $regex: queryObj.filter.toUpperCase() } },
          { productCategory: { $regex: queryObj.filter.toUpperCase() } },
          { type: { $regex: queryObj.filter.toUpperCase() } },
          { createdAt: { $regex: queryObj.filter.toUpperCase() } },
          { modifiedAt: { $regex: queryObj.filter.toUpperCase() } }
        ],
        $and: [{ companyId: companyIdIn }]
      });
    } else {
      this.query = this.query.find({
        companyId: companyIdIn
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
