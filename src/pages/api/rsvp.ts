import type { APIRoute } from 'astro';

// Mark this API route as server-rendered
export const prerender = false;

import pkg from 'airtable-ts';
const { AirtableTs } = pkg;
import type { FieldSet } from 'airtable';
import type { Records } from 'airtable';

const db = new AirtableTs({
  apiKey: import.meta.env.AIRTABLE_API_KEY
});

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('yep api keyexists:', !!import.meta.env.AIRTABLE_API_KEY);
    console.log('base ID:', 'app' + import.meta.env.AIRTABLE_BASE_ID);
    console.log('table ID:', 'tblK9NsD5WoD1zxhY');

    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Content-Type must be application/json'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const formData = await request.json();
    const { email } = formData;

    if (!email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email is required'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('creating base connection...');
    const base = db.airtable.base('app' + import.meta.env.AIRTABLE_BASE_ID);
    console.log('base created, accessing table...');
    const table = base('tblK9NsD5WoD1zxhY');
    console.log('table accessed get info...');

    // Get number of records in table
    let recordCount = 0;
    try {
      const allRecords = await table
        .select({
          pageSize: 100
        })
        .all();
      if (allRecords.length > 0) {
        console.log('sample record fields:', Object.keys(allRecords[0].fields));
      }

      recordCount = allRecords.length;
    } catch (schemaError) {
      console.log('error getting records:', schemaError);
    }

    console.log('table read, found', recordCount, 'records');

    console.log('creating record...');
    const record = await table.create({
      'Email Address': email
    });
    console.log('record created successfully:', record.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'submitted!!',
        recordId: record.id,
        recordCount: recordCount
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('error submitting rsvp:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'failed to submit rsvp. please try again.'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};
