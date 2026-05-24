 async function testAPI() {
  try {
    console.log("Testing /medicines/summary endpoint...");
    const res1 = await fetch('http://localhost:5000/medicines/summary');
    const summary = await res1.json();
    console.log("Summary:", summary);
    
    console.log("\nTesting /medicines?page=1&limit=50 endpoint...");
    const res2 = await fetch('http://localhost:5000/medicines?page=1&limit=50');
    const page1 = await res2.json();
    console.log("Page 1 response:", {
      dataLength: page1.data?.length,
      total: page1.total,
      page: page1.page,
      totalPages: page1.totalPages
    });
    
    if (page1.data && page1.data.length > 0) {
      console.log("First medicine:", page1.data[0]);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

testAPI();
