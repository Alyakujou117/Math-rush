    // Same-device adventures retain untimed turns and math questions.
    beginCountdown = function () {
      clearInterval(clockId);
      clockId = null;
      document.getElementById('timerBox')?.classList.add('hidden');
    };
  
