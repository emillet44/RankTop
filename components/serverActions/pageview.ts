'use server'

let propertyId = '402469134';

const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const options = {
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PROJECT_ID
  },
  projectId: process.env.GOOGLE_PRIVATE_KEY
}

const analyticsDataClient = new BetaAnalyticsDataClient(options);

//This server action runs a Google Analytics report, with a date range, and a page path that matches the "pathname" given by the page that called the server action
//and screenPageViews, which is the total number of views on the page from users(not unique)
export async function runReport(pathname: string) {

  let views = 0;
  
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [
      {
        startDate: '2020-03-31',
        endDate: 'today',
      },
    ],
    dimensions: [
      {
        name: "pagePath",
      },
    ],
    dimensionFilter: {
      filter: {
        fieldName: "pagePath",
        stringFilter: {
          matchType: "EXACT",
          value: pathname,
        }
      }
    },
    metrics: [
      {
        name: 'screenPageViews',
      },
    ],
  });

  response.rows.forEach((row: { dimensionValues: any[]; metricValues: any[]; }) => {
    views = row.metricValues[0].value;
  });

  return views;
}