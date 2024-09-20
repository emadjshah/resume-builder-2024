document.getElementById("resumeForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const skills = document.getElementById("skills").value.split(",").map(skill => skill.trim());
  const experience = document.getElementById("experience").value;
  const education = document.getElementById("education").value;
  const projects = document.getElementById("projects").value;
  const certifications = document.getElementById("certifications").value.split(",").map(cert => cert.trim());
  const languages = document.getElementById("languages").value.split(",").map(lang => lang.trim());

  const resumeHTML = `
  <div class="resume-section personal-info">
    <h1>${name}</h1>
    <p>Email: ${email}</p>
    <p>Phone: ${phone}</p>
  </div>
  <hr>
  <div class="resume-section" id="skills-section">
    <h2>Skills</h2>
    <ul>
      ${skills.map(skill => `<li>${skill}</li>`).join('')}
    </ul>
  </div>
  <hr>
  <div class="resume-section" id="experience-section">
    <h2>Experience</h2>
    <p>${experience}</p>
  </div>
  <hr>
  <div class="resume-section" id="education-section">
    <h2>Education</h2>
    <p>${education}</p>
  </div>
  <hr>
  <div class="resume-section" id="projects-section">
    <h2>Projects</h2>
    <p>${projects}</p>
  </div>
  <hr>
  <div class="resume-section" id="certifications-section">
    <h2>Certifications</h2>
    <ul>
      ${certifications.map(cert => `<li>${cert}</li>`).join('')}
    </ul>
  </div>
  <hr>
  <div class="resume-section" id="languages-section">
    <h2>Languages</h2>
    <ul>
      ${languages.map(lang => `<li>${lang}</li>`).join('')}
    </ul>
  </div>
`;

  document.getElementById("resumePreview").innerHTML = resumeHTML;

  document.getElementById("downloadBtn").style.display = "block";

  enableDragAndDrop();
});

function enableDragAndDrop() {
  const previewSections = document.querySelectorAll('.resume-section');
  let draggedElement = null;

  previewSections.forEach(section => {
    section.addEventListener('dragstart', (event) => {
      draggedElement = section;
      setTimeout(() => {
        section.style.display = 'none'; 
      }, 0);
    });

    section.addEventListener('dragend', () => {
      setTimeout(() => {
        draggedElement.style.display = 'block';
        draggedElement = null;
      }, 0);
    });

    section.addEventListener('dragover', (event) => {
      event.preventDefault(); 
    });

    section.addEventListener('drop', (event) => {
      event.preventDefault();
      if (section !== draggedElement) {
        const previewContainer = document.getElementById('resumePreview');
        previewContainer.insertBefore(draggedElement, section);
      }
    });
  });
}

document.getElementById("downloadBtn").addEventListener("click", function () {
  const resume = document.getElementById("resumePreview");

  if (!resume) {
    console.error("Element with ID 'resumePreview' not found!");
    alert("Resume preview section is missing.");
    return;
  }

  html2canvas(resume, {
    scale: 2,
    useCORS: true,
    logging: true
  }).then(canvas => {
    console.log("Canvas successfully created!");

    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const imgWidth = 210; 
    const pageHeight = 297; 
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("resume.pdf");

  }).catch(err => {
    console.error("Error generating the PDF:", err);
    alert("An error occurred while generating the PDF. Please check the console for more details.");
  });
});
