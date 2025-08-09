import jsPDF from 'jspdf';

interface Course {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  price?: number;
  location: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  periodicity: 'once' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';
  timezone: string;
  weekdays: number[];
  week_of_month?: number | null;
  interval: number;
  exclude_dates: string[];
  max_attendants: number;
  duration_hours?: number;
  formatted_schedule?: string;
  schedule_description?: string;
  next_occurrences?: string[];
  weekday_display?: string[];
}

export const generateCoursesCatalogPDF = async (
  courses: Course[], 
  locale: string = 'es', 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t?: any
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  
  let currentY = margin;
  let pageNumber = 1;

  // Colors
  const primaryColor = '#22A60D';
  const secondaryColor = '#666666';

  // Helper function to add new page
  const addNewPage = () => {
    pdf.addPage();
    pageNumber++;
    currentY = margin;
    addPageFooter();
  };

  // Helper function to add page footer
  const addPageFooter = () => {
    // Page number
    pdf.setFontSize(10);
    pdf.setTextColor(secondaryColor);
    pdf.text(`${pageNumber}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
    
    // Contact info
    pdf.text('ordinalysoftware@gmail.com | www.ordinaly.ai', margin, pageHeight - 15);
  };

  // Helper function to check if we need new page
  const checkPageBreak = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - 30) {
      addNewPage();
    }
  };

  // Helper function to wrap text
  const wrapText = (text: string, maxWidth: number, fontSize: number) => {
    pdf.setFontSize(fontSize);
    return pdf.splitTextToSize(text, maxWidth);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper function to format time
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

  // Helper function to get translated text with fallback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getText = (key: string, fallbackEs: string, fallbackEn: string, params?: any) => {
    if (t) {
      try {
        return t(key, params);
      } catch {
        // Fallback to manual translation if key not found
        return locale === 'es' ? fallbackEs : fallbackEn;
      }
    }
    return locale === 'es' ? fallbackEs : fallbackEn;
  };

  // Helper function to load image as base64
  const loadImageAsBase64 = async (imagePath: string): Promise<string> => {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw error;
    }
  };

  // Helper function to load and add logo
  const addLogo = async () => {
    try {
      // Try to load the actual logo image
      const logoBase64 = await loadImageAsBase64('/logo.webp');
      
      pdf.addImage(logoBase64, 'WEBP', margin, currentY, 40, 40);
      
      // Company name next to logo
      pdf.setFontSize(28);
      pdf.setTextColor('#22A60D');
      pdf.setFont('helvetica', 'bold');
      pdf.text('ORDINALY', margin + 50, currentY + 15);
      
      pdf.setFontSize(14);
      pdf.setTextColor('#666666');
      pdf.setFont('helvetica', 'normal');
    const slogan = getText(
      'pdf.slogan',
      'Soluciones de Software y Formación',
      'Software & Training Solutions'
    );
    pdf.text(slogan, margin + 50, currentY + 25);
      
      pdf.setDrawColor('#22A60D');
      pdf.setLineWidth(0.8);
      pdf.line(margin, currentY + 35, margin + 140, currentY + 35);
      
      currentY += 45;
    } catch (error) {
      // Fallback to text-only logo
      pdf.setFontSize(28);
      pdf.setTextColor('#22A60D');
      pdf.setFont('helvetica', 'bold');
      pdf.text('ORDINALY', margin, currentY + 12);
      
      pdf.setFontSize(14);
      pdf.setTextColor('#666666');
      pdf.setFont('helvetica', 'normal');
      pdf.text('Software & Formation Solutions', margin, currentY + 25);
      
      pdf.setDrawColor('#22A60D');
      pdf.setLineWidth(0.8);
      pdf.line(margin, currentY + 30, margin + 120, currentY + 30);
      
      currentY += 40;
    }
  };

  await addLogo();
  
  // Main title
  pdf.setFontSize(28);
  pdf.setTextColor('#000000');
  pdf.setFont('helvetica', 'bold');
  const mainTitle = getText('pdf.title', 'Catálogo de Formación', 'Training Catalog');
  pdf.text(mainTitle, pageWidth / 2, currentY + 20, { align: 'center' });
  
  // Subtitle
  pdf.setFontSize(16);
  pdf.setTextColor(secondaryColor);
  pdf.setFont('helvetica', 'normal');
  const subtitle = getText(
    'pdf.subtitle', 
    'Cursos de formación y tecnológica',
    'Training and technological courses'
  );
  pdf.text(subtitle, pageWidth / 2, currentY + 35, { align: 'center' });
  
  // Date
  const currentDate = new Date().toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  pdf.setFontSize(12);
  pdf.text(currentDate, pageWidth / 2, currentY + 50, { align: 'center' });
  
  currentY += 80;

  const introduction = getText(
    'pdf.introduction',
    'En Ordinaly, ofrecemos formación especializada en tecnologías emergentes y desarrollo profesional. Nuestros cursos están diseñados para impulsar tu carrera profesional con contenido actualizado y metodologías innovadoras.',
    'At Ordinaly, we offer specialized training in emerging technologies and professional development. Our courses are designed to boost your professional career with up-to-date content and innovative methodologies.'
  );

  const introLines = wrapText(introduction, contentWidth, 12);
  pdf.setFontSize(12);
  pdf.setTextColor('#000000');
  pdf.setFont('helvetica', 'normal');
  
  introLines.forEach((line: string) => {
    checkPageBreak(15);
    pdf.text(line, margin, currentY);
    currentY += 7;
  });

  currentY += 20;
  addPageFooter();

  addNewPage();
  
  // Courses section title
  pdf.setFontSize(22);
  pdf.setTextColor(primaryColor);
  pdf.setFont('helvetica', 'bold');
  const coursesTitle = getText('pdf.coursesTitle', 'Nuestros Cursos', 'Our Courses');
  pdf.text(coursesTitle, margin, currentY);
  currentY += 20;

  // Separate upcoming and past courses
  const now = new Date();
  // Include all courses, regardless of date/time completeness
  const upcomingCourses = courses.filter(course => {
    // If course has a valid start_date, use it for sorting/upcoming; otherwise, treat as upcoming
    if (course.start_date && course.start_date !== "0000-00-00") {
      return new Date(course.start_date) >= now;
    }
    return true;
  });

  if (upcomingCourses.length > 0) {
    pdf.setFontSize(18);
    pdf.setTextColor('#000000');
    pdf.setFont('helvetica', 'bold');
    const upcomingTitle = getText('pdf.upcomingCourses', 'Próximos Cursos', 'Upcoming Courses');
    pdf.text(upcomingTitle, margin, currentY);
    currentY += 15;

    upcomingCourses.forEach((course) => {
      const courseHeight = 90; // Estimated height for each course
      checkPageBreak(courseHeight);

      // Course background
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, currentY, contentWidth, courseHeight - 5, 'F');

      // Course title
      pdf.setFontSize(16);
      pdf.setTextColor(primaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text(course.title, margin + 5, currentY + 12);

      // Course subtitle
      if (course.subtitle) {
        pdf.setFontSize(12);
        pdf.setTextColor(secondaryColor);
        pdf.setFont('helvetica', 'italic');
        pdf.text(course.subtitle, margin + 5, currentY + 22);
      }

      // Course description
      pdf.setFontSize(10);
      pdf.setTextColor('#000000');
      pdf.setFont('helvetica', 'normal');
      const descLines = wrapText(course.description, contentWidth - 20, 10);
      let descY = currentY + (course.subtitle ? 30 : 25);
      descLines.slice(0, 3).forEach((line: string) => { // Limit to 3 lines
        pdf.text(line, margin + 5, descY);
        descY += 5;
      });

      // Course details
      const detailsY = currentY + 55;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#000000');

      // Date and time (show fallback if missing)
      const dateLabel = getText('pdf.date', 'Fecha:', 'Date:');
      let dateText = course.start_date && course.start_date !== "0000-00-00"
        ? formatDate(course.start_date)
        : getText('pdf.noSpecificDate', 'Por confirmar', 'TBA');
      pdf.text(`${dateLabel} ${dateText}`, margin + 5, detailsY);

      const timeLabel = getText('pdf.time', 'Horario:', 'Time:');
      let timeText = (course.start_time && course.end_time)
        ? `${formatTime(course.start_time)} - ${formatTime(course.end_time)}`
        : getText('pdf.noSpecificTime', 'Por confirmar', 'TBA');
      pdf.text(`${timeLabel} ${timeText}`, margin + 5, detailsY + 8);

      // Location
      const locationLabel = getText('pdf.location', 'Ubicación:', 'Location:');
      pdf.text(`${locationLabel} ${course.location}`, margin + 5, detailsY + 16);

      // Price and capacity
      const priceLabel = getText('pdf.price', 'Precio:', 'Price:');
      const price = course.price ? `€ ${course.price}` : getText('pdf.free', 'Gratuito', 'Free');
      pdf.text(`${priceLabel} ${price}`, margin + 100, detailsY);

      const capacityLabel = getText('pdf.capacity', 'Capacidad:', 'Capacity:');
      const peopleLabel = getText('pdf.people', 'personas', 'people');
      pdf.text(`${capacityLabel} ${course.max_attendants} ${peopleLabel}`, margin + 100, detailsY + 8);

      currentY += courseHeight;
    });
  }

  currentY += 20;
  checkPageBreak(60);

  pdf.setFontSize(18);
  pdf.setTextColor(primaryColor);
  pdf.setFont('helvetica', 'bold');
  const contactTitle = getText('pdf.contactTitle', 'Información de Contacto', 'Contact Information');
  pdf.text(contactTitle, margin, currentY);
  currentY += 15;

  pdf.setFontSize(12);
  pdf.setTextColor('#000000');
  pdf.setFont('helvetica', 'normal');

  const contactInfo = [
    { 
      label: getText('pdf.email', 'Email:', 'Email:'), 
      value: 'ordinalysoftware@gmail.com' 
    },
    { 
      label: getText('pdf.website', 'Web:', 'Website:'), 
      value: 'www.ordinaly.ai' 
    },
    { 
      label: getText('pdf.specialization', 'Especialización:', 'Specialization:'), 
      value: getText(
        'pdf.specializationText',
        'Desarrollo de Software y Formación Tecnológica',
        'Software Development and Technology Training'
      )
    }
  ];

  contactInfo.forEach(info => {
    pdf.setFont('helvetica', 'bold');
    pdf.text(info.label, margin, currentY);
    pdf.setFont('helvetica', 'normal');
    pdf.text(info.value, margin + 45, currentY);
    currentY += 10;
  });

  addPageFooter();

  // Save the PDF
  const fileName = getText(
    'pdf.filename',
    'Catalogo_Formacion_Ordinaly.pdf',
    'Ordinaly_Training_Catalog.pdf'
  );
  pdf.save(fileName);
};
