import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContext } from '.';
import './Tour.css';

export default function Tour() {
  const { t } = useTranslation();
  const { toggle } = useContext(DialogContext)!;
  const [currentStep, setCurrentStep] = useState(0);

  const tourSteps = [
    {
      title: t('tourStep1Title'),
      text: t('tourStep1Text'),
      highlight: null
    },
    {
      title: t('tourStep2Title'), 
      text: t('tourStep2Text'),
      highlight: 'board'
    },
    {
      title: t('tourStep3Title'),
      text: t('tourStep3Text'), 
      highlight: 'dice'
    },
    {
      title: t('tourStep4Title'),
      text: t('tourStep4Text'),
      highlight: 'pieces'
    },
    {
      title: t('tourStep5Title'),
      text: t('tourStep5Text'),
      highlight: 'toolbar'
    },
    {
      title: t('tourStep6Title'),
      text: t('tourStep6Text'),
      highlight: 'login'
    },
    {
      title: t('tourStep7Title'),
      text: t('tourStep7Text'),
      highlight: 'friends'
    },
    {
      title: t('tourStep8Title'),
      text: t('tourStep8Text'),
      highlight: null
    },
    {
      title: t('tourStep9Title'),
      text: t('tourStep9Text'),
      highlight: null
    }
  ];

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      toggle(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTour = () => {
    toggle(false);
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <section id="tour">
      <header>
        <h1>{t('tourTitle')}</h1>
        <button 
          className="skip-button"
          onPointerUp={skipTour}
          aria-label={t('skip')}
        >
          {t('skip')}
        </button>
      </header>
      
      <div className="tour-content">
        <div className="tour-progress">
          <div 
            className="tour-progress-bar"
            style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
          />
        </div>
        
        <div className="tour-step">
          <h2>{currentTourStep.title}</h2>
          <p>{currentTourStep.text}</p>
        </div>
        
        <div className="tour-step-counter">
          {currentStep + 1} / {tourSteps.length}
        </div>
      </div>

      <footer className="tour-navigation">
        <button 
          className="tour-btn tour-btn-secondary"
          onPointerUp={prevStep}
          disabled={currentStep === 0}
        >
          {t('previous')}
        </button>
        
        <button 
          className="tour-btn tour-btn-primary"
          onPointerUp={nextStep}
        >
          {currentStep === tourSteps.length - 1 ? t('finish') : t('next')}
        </button>
      </footer>
    </section>
  );
}