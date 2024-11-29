document.getElementById('addToHouseApp').addEventListener('click', async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (tab.url.includes('otodom.pl')) {
    try {
      // Tutaj będzie URL Twojej aplikacji
      const houseappUrl = 'https://houseapp-uhmg.vercel.app/';
      
      // Otwieramy nową kartę z aplikacją i przekazujemy URL
      window.open(`${houseappUrl}?url=${encodeURIComponent(tab.url)}`, '_blank');
    } catch (error) {
      console.error('Błąd:', error);
    }
  } else {
    alert('Ta strona nie jest z serwisu Otodom');
  }
});
