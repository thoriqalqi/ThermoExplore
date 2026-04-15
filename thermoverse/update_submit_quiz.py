import os

files = ['level1.html', 'level2.html', 'level3.html']
base_dir = '/Users/macair4/Documents/build/ThermoExplore/thermoverse/'

old_func = """function submitQuiz() {
  switchTab('ct');
}"""

new_func = """function submitQuiz() {
  const panel = document.getElementById('panel-quiz');
  if (!panel) return switchTab('ct');
  
  if (panel.dataset.evaluated === 'true') {
    switchTab('ct');
    return;
  }
  
  const questions = panel.querySelectorAll('input[type="radio"]:checked');
  if (questions.length < 10) {
    alert('⚠️ Mohon jawab SEMUA soal kuis terlebih dahulu!');
    return;
  }
  
  let score = 0;
  // Disable all inputs
  panel.querySelectorAll('input[type="radio"]').forEach(inp => inp.closest('.option-btn').style.pointerEvents = 'none');
  
  questions.forEach(q => {
    const parentLabel = q.closest('.option-btn');
    if (q.value === "True") {
      score += 10;
      parentLabel.classList.add('correct');
    } else {
      parentLabel.classList.add('wrong');
      // Highlight the correct one
      const correctInp = panel.querySelector(`input[name="${q.name}"][value="True"]`);
      if (correctInp) {
        correctInp.closest('.option-btn').classList.add('correct');
      }
    }
  });
  
  alert(`🎯 Kuis Selesai!\\nSkor Awal Tim Kamu: ${score} / 100\\n\\nPerhatikan blok merah (jawaban salah) dan blok hijau (jawaban benar) sebelum lanjut.`);
  panel.dataset.evaluated = 'true';
  
  const btn = panel.querySelector('button[onclick="submitQuiz()"]');
  if (btn) btn.innerHTML = '➡️ Lanjut ke Mode Tantangan Berwaktu';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}"""

for filename in files:
    filepath = os.path.join(base_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content.replace(old_func, new_func)

    if content != new_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated submitQuiz in {filename}")
    else:
        print(f"submitQuiz not found or already updated in {filename}")

