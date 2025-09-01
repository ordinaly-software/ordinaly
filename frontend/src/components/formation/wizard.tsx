// Wizard.tsx
"use client";
import React, { useEffect, useState } from "react";
import WizardHeader from "./wizard-header";

import EnrollmentConfirmationModal from "./enrollment-confirmation-modal";
import type { Course } from "@/utils/pdf-generator";


interface WizardProps {
  courses: Course[];
}


const Wizard: React.FC<WizardProps> = ({ courses }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Step 1: Select course
  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setCurrentStep(2);
  };

  // Step 2: Confirm details
  const handleConfirmDetails = () => {
    setShowModal(true);
    setCurrentStep(3);
  };

  // Step 3: Modal handles enrollment/payment

  const goToPreviousStep = () => {
    if (currentStep === 2) {
      setSelectedCourse(null);
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setShowModal(false);
      setCurrentStep(2);
    }
  };

  return (
    <div className="w-full p-8">
      <div className="max-w-4xl mx-auto">
        <WizardHeader steps={[
          { step: 1, label: "Selecciona curso" },
          { step: 2, label: "Confirma detalles" },
          { step: 3, label: "Inscríbete/Paga" },
        ]} currentStep={currentStep} />

        <div className="mt-8 w-full bg-white rounded shadow p-6">
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Selecciona un curso</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {courses.map((course) => (
                  <div key={course.id} className={`border rounded-lg p-4 cursor-pointer hover:border-[#22A60D] ${selectedCourse?.id === course.id ? 'border-[#22A60D] ring-2 ring-[#22A60D]' : ''}`}
                    onClick={() => handleSelectCourse(course)}>
                    <div className="font-bold text-lg mb-2">{course.title}</div>
                    <div className="text-gray-500 mb-1">{course.subtitle}</div>
                    <div className="text-sm text-gray-700 mb-1">{course.description}</div>
                    <div className="text-sm text-gray-700">{course.price ? `€${course.price}` : 'Gratis'}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="px-6 py-2 rounded-xl bg-[#05668D] text-white hover:bg-[#05918F] transition-colors disabled:opacity-50"
                  onClick={() => selectedCourse && setCurrentStep(2)}
                  disabled={!selectedCourse}
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
          {currentStep === 2 && selectedCourse && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Confirma los detalles del curso</h3>
              <div className="mb-4">
                <div className="font-bold text-lg">{selectedCourse.title}</div>
                <div className="text-gray-500 mb-1">{selectedCourse.subtitle}</div>
                <div className="text-sm text-gray-700 mb-1">{selectedCourse.description}</div>
                <div className="text-sm text-gray-700">{selectedCourse.price ? `€${selectedCourse.price}` : 'Gratis'}</div>
              </div>
              <div className="flex justify-between">
                <button
                  className="px-6 py-2 rounded-xl bg-white border-2 border-[#65C2C9] text-[#65C2C9] hover:bg-[#65C2C9] hover:text-white transition-colors"
                  onClick={goToPreviousStep}
                >
                  Atrás
                </button>
                <button
                  className="px-6 py-2 rounded-xl bg-[#05668D] text-white hover:bg-[#05918F] transition-colors"
                  onClick={handleConfirmDetails}
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}
          {currentStep === 3 && selectedCourse && (
            <EnrollmentConfirmationModal
              isOpen={showModal}
              onClose={() => { setShowModal(false); setCurrentStep(2); }}
              selectedCourse={selectedCourse}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Wizard;