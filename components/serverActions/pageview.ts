'use server'

let propertyId = '402469134';

export async function runReport(pathname: string) {
  const { BetaAnalyticsDataClient } = require('@google-analytics/data');
  
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const options = {
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: privateKey
    },
    projectId: process.env.GOOGLE_PROJECT_ID
  }

  const analyticsDataClient = new BetaAnalyticsDataClient(options);

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
    views = Number(row.metricValues[0].value);
  });

  return views;
}