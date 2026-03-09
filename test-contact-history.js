// Test if the contact history table is being populated correctly
const { db } = require('./lib/db');
const { bookingContactHistory } = require('./lib/db/schema');

async function testContactHistory() {
  try {
    const result = await db
      .select()
      .from(bookingContactHistory)
      .limit(10);
    
    console.log('Contact history entries:', result.length);
    console.log('Sample entry:', result[0]);
  } catch (error) {
    console.error('Error:', error);
  }
}

testContactHistory();
