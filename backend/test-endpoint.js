// Quick test to verify API endpoints work
(async () => {
  try {
    console.log('Testing /medicines/summary...');
    const response = await fetch('http://localhost:5000/medicines/summary');
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Response:', data);
    } else {
      console.log('❌ Error response');
      console.log('Text:', await response.text());
    }
  } catch (err) {
    console.error('❌ Fetch error:', err.message);
  }
})();
