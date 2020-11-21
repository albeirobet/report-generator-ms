/* eslint-disable no-const-assign */
/* eslint-disable radix */
// Created By Eyder Ascuntar Rosales
// Mail: eyder.ascuntar@runcode.co
// Company: Runcode Ingeniería SAS
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  // =========== Function to filter specific properties to udpate

  filter(companyIdIn, counter, filterColumns) {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    const filterArray = [];
    let filterObject = {};
    if (queryObj.filter) {
      if (filterColumns && filterColumns.length > 0) {
        filterColumns.forEach(function(elemento) {
          filterObject[elemento] = { $regex: queryObj.filter };
          filterArray.push(filterObject);
          filterObject = {};
        });
      }
      excludedFields.push('filter');
    }

    excludedFields.forEach(el => delete queryObj[el]);
    // Agregando propiedad empresa
    queryObj.companyId = companyIdIn;
    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    //console.log(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr));
    if (filterArray.length > 0) {
      this.query.or(filterArray);
    }
    if (counter === true) {
      this.query.countDocuments();
      return this;
    }
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
    // eslint-disable-next-line prefer-const
    let { createdAtFrom } = queryObj;
    let { createdAtTo } = queryObj;
    if (createdAtFrom) {
      if (!createdAtTo) {
        createdAtTo = createdAtFrom;
      }
    }
    console.log(`Fecha de Inicio: ${createdAtFrom}`);
    console.log(`Fecha de Fin: ${createdAtTo}`);

    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields',
      'createdAtFrom',
      'createdAtTo'
    ];
    excludedFields.forEach(el => delete queryObj[el]);
    if (queryObj.filter) {
      this.query = this.query.find({
        $or: [
          { serviceId: { $regex: queryObj.filter } },
          { name: { $regex: queryObj.filter } },
          { baseUnitMeasure: { $regex: queryObj.filter.toUpperCase() } },
          { productCategory: { $regex: queryObj.filter.toUpperCase() } },
          { type: { $regex: queryObj.filter.toUpperCase() } }
        ],
        $and: [
          { companyId: companyIdIn },
          {
            createdAt: {
              $gte: new Date(createdAtFrom),
              $lte: new Date(createdAtTo)
            }
          }
        ]
      });
    } else {
      this.query = this.query.find({
        createdAt: {
          $gte: new Date(createdAtFrom),
          $lt: new Date(createdAtTo)
        },
        $and: [{ companyId: companyIdIn }]
      });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('+createdAt');
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
