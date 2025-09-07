import jsPDF from 'jspdf';


export interface Course {
  id: number;
  slug?: string;
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
  created_at: string;
  updated_at: string;
  duration_hours?: number;
  formatted_schedule?: string;
  schedule_description?: string;
  next_occurrences?: string[];
  weekday_display?: string[];
}

export async function generateCoursesCatalogPDF(
  courses: Course[],
  t: (key: string, params?: Record<string, string | number | Date>) => string
) {
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
    // Use browser locale for formatting, or customize as needed
    return date.toLocaleDateString(undefined, {
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

  // All translation is now handled by the provided t function
  const bonificationDisclaimer = t('bonificationDisclaimer');

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
    } catch {
      throw new Error('Failed to load image as base64');
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
  const slogan = t('slogan');
    pdf.text(slogan, margin + 50, currentY + 25);
      
      pdf.setDrawColor('#22A60D');
      pdf.setLineWidth(0.8);
      pdf.line(margin, currentY + 35, margin + 140, currentY + 35);
      
      currentY += 45;
    } catch {
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
  const mainTitle = t('title');
  pdf.text(mainTitle, pageWidth / 2, currentY + 20, { align: 'center' });
  
  // Subtitle
  pdf.setFontSize(16);
  pdf.setTextColor(secondaryColor);
  pdf.setFont('helvetica', 'normal');
  const subtitle = t('subtitle');
  const subtitleLines = wrapText(subtitle, contentWidth, 16);
  let subtitleY = currentY + 35;
  subtitleLines.forEach((line: string) => {
    pdf.text(line, pageWidth / 2, subtitleY, { align: 'center' });
    subtitleY += 8;
  });
  // Adjust currentY for date and following content
  const subtitleBlockHeight = (subtitleLines.length - 1) * 8;
  
  // Date
  // Use browser locale for current date
  const currentDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  pdf.setFontSize(12);
  pdf.text(currentDate, pageWidth / 2, currentY + 50 + subtitleBlockHeight, { align: 'center' });
  
  currentY += 80 + subtitleBlockHeight;

  const introduction = t('introduction');

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

  // Bonification disclaimer block (styled)
  const bonifLines = wrapText(bonificationDisclaimer, contentWidth, 11);
  pdf.setFontSize(11);
  pdf.setTextColor('#22A60D');
  pdf.setFont('helvetica', 'bold');
  pdf.text(t('bonificationTitle'), margin, currentY);
  currentY += 8;
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor('#333333');
  bonifLines.forEach((line: string) => {
    checkPageBreak(10);
    pdf.text(line, margin, currentY);
    currentY += 6;
  });

  currentY += 10;
  addPageFooter();
  addNewPage();
  
  // Courses section title
  pdf.setFontSize(22);
  pdf.setTextColor(primaryColor);
  pdf.setFont('helvetica', 'bold');
  const coursesTitle = t('coursesTitle');
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
    currentY += 15;

    upcomingCourses.forEach((course) => {
      // Dynamic height calculation for each course block
      const descLines = wrapText(course.description, contentWidth - 20, 10);
      const descLineCount = Math.min(descLines.length, 3);
      // Calculate Y positions for all elements
      let y = currentY + 12; // title
      if (course.subtitle) y += 10; // subtitle
      y += descLineCount * 5; // description
      y += 5; // space before details
      y += 16; // details block (3 lines, 8px apart)
      const blockHeight = y - currentY + 20;
      checkPageBreak(blockHeight);

      // Course background (now fits content)
      pdf.setFillColor(250, 250, 250);
      pdf.rect(margin, currentY, contentWidth, blockHeight, 'F');

      // Course title
      pdf.setFontSize(16);
      pdf.setTextColor(primaryColor);
      pdf.setFont('helvetica', 'bold');
      pdf.text(wrapText(course.title, contentWidth - 10, 16)[0], margin + 5, currentY + 12, { maxWidth: contentWidth - 10 });

      // Course subtitle
      let subtitleY = currentY + 12;
      if (course.subtitle) {
        subtitleY += 10;
        pdf.setFontSize(12);
        pdf.setTextColor(secondaryColor);
        pdf.setFont('helvetica', 'italic');
        pdf.text(wrapText(course.subtitle, contentWidth - 10, 12)[0], margin + 5, subtitleY, { maxWidth: contentWidth - 10 });
      }

      // Course description
      pdf.setFontSize(10);
      pdf.setTextColor('#000000');
      pdf.setFont('helvetica', 'normal');
      let descY = currentY + (course.subtitle ? 32 : 25);
      descLines.slice(0, 3).forEach((line: string) => {
        pdf.text(line, margin + 5, descY, { maxWidth: contentWidth - 20 });
        descY += 5;
      });

      // Course details
      const detailsY = descY + 5;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#000000');

      // Date and time (show fallback if missing)
  const dateLabel = t('date');
      const dateText = course.start_date && course.start_date !== "0000-00-00"
        ? formatDate(course.start_date)
  : t('noSpecificDate');
      pdf.text(`${dateLabel}: ${dateText}`, margin + 5, detailsY);

  const timeLabel = t('time');
      const timeText = (course.start_time && course.end_time)
        ? `${formatTime(course.start_time)} - ${formatTime(course.end_time)}`
  : t('noSpecificTime');
      pdf.text(`${timeLabel} ${timeText}`, margin + 5, detailsY + 8);

      // Location
  const locationLabel = t('location');
  const locationText = (course.location && course.location !== "null" && course.location !== "")
    ? course.location
    : t('locationSoon');
  pdf.text(`${locationLabel}: ${locationText}`, margin + 5, detailsY + 16);

      // Price and capacity
  const priceLabel = t('price');
  const price = course.price ? `€ ${course.price}` : t('free');
      pdf.text(`${priceLabel}: ${price}`, margin + 100, detailsY);

  const capacityLabel = t('capacity');
  const peopleLabel = t('people');
      pdf.text(`${capacityLabel} ${course.max_attendants} ${peopleLabel}`, margin + 100, detailsY + 8);

      currentY += blockHeight;
    });
  }

  currentY += 20;
  checkPageBreak(60);

  pdf.setFontSize(18);
  pdf.setTextColor(primaryColor);
  pdf.setFont('helvetica', 'bold');
  const contactTitle = t('contactTitle');
  pdf.text(contactTitle, margin, currentY);
  currentY += 15;

  pdf.setFontSize(12);
  pdf.setTextColor('#000000');
  pdf.setFont('helvetica', 'normal');

  const contactInfo = [
    { 
  label: t('email'),
      value: 'ordinalysoftware@gmail.com' 
    },
    { 
  label: t('website'),
      value: 'www.ordinaly.ai' 
    },
    { 
  label: t('specialization'),
  value: t('specializationText')
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
  const fileName = t('filename');
  pdf.save(fileName);
};


