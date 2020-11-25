const ReportCreator = require('../../models/reportCreatorModel');
const ReportUploader = require('../../models/reportUploaderModel');
const ReportDownloader = require('../../models/reportDownloaderModel');

exports.updateReportCreator = async objectReportResume => {
  await ReportCreator.updateOne(
    { companyId: objectReportResume.companyId, code: objectReportResume.code },
    {
      state: objectReportResume.state,
      percentageCompletition: objectReportResume.percentageCompletition,
      counterRows: objectReportResume.counterRows,
      message: objectReportResume.message,
      startDate: objectReportResume.startDate,
      endDate: objectReportResume.endDate,
      generatorUserId: objectReportResume.generatorUserId
    }
  );
};

exports.updateReportUploader = async objectReportResume => {
  await ReportUploader.updateOne(
    { companyId: objectReportResume.companyId, code: objectReportResume.code },
    {
      state: objectReportResume.state,
      percentageCompletition: objectReportResume.percentageCompletition,
      counterRows: objectReportResume.counterRows,
      message: objectReportResume.message,
      startDate: objectReportResume.startDate,
      endDate: objectReportResume.endDate,
      generatorUserId: objectReportResume.generatorUserId
    }
  );
};

exports.updateReportDownloader = async objectReportResume => {
  await ReportDownloader.updateOne(
    { companyId: objectReportResume.companyId, code: objectReportResume.code },
    {
      state: objectReportResume.state,
      percentageCompletition: objectReportResume.percentageCompletition,
      counterRows: objectReportResume.counterRows,
      message: objectReportResume.message,
      startDate: objectReportResume.startDate,
      endDate: objectReportResume.endDate,
      generatorUserId: objectReportResume.generatorUserId
    }
  );
};
