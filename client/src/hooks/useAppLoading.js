import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour gérer les étapes de chargement de l'application
 * Fournit un contrôle précis sur l'expérience utilisateur au démarrage
 */
const useAppLoading = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('initializing');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Étapes de chargement avec leurs durées (définies une seule fois)
  const loadingSteps = React.useMemo(() => [
    { step: 'initializing', duration: 1000, progress: 20 },
    { step: 'location', duration: 2000, progress: 40 },
    { step: 'weather', duration: 1500, progress: 60 },
    { step: 'forecast', duration: 1000, progress: 80 },
    { step: 'background', duration: 800, progress: 100 }
  ], []);

  // Démarrer le processus de chargement
  const startLoading = useCallback(() => {
    setIsLoading(true);
    setLoadingStep('initializing');
    setLoadingProgress(0);
    
    let currentStepIndex = 0;
    
    const processNextStep = () => {
      if (currentStepIndex < loadingSteps.length) {
        const currentStep = loadingSteps[currentStepIndex];
        setLoadingStep(currentStep.step);
        setLoadingProgress(currentStep.progress);
        
        setTimeout(() => {
          currentStepIndex++;
          processNextStep();
        }, currentStep.duration);
      } else {
        // Terminé
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    
    processNextStep();
  }, [loadingSteps]);

  // Forcer la fin du chargement
  const finishLoading = useCallback(() => {
    setLoadingStep('background');
    setLoadingProgress(100);
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  // Avancer à une étape spécifique
  const setStep = useCallback((step) => {
    const stepData = loadingSteps.find(s => s.step === step);
    if (stepData) {
      setLoadingStep(step);
      setLoadingProgress(stepData.progress);
    }
  }, [loadingSteps]);

  // Démarrer automatiquement au montage
  useEffect(() => {
    // Délai initial pour une meilleure UX
    setTimeout(() => {
      startLoading();
    }, 100);
  }, [startLoading]);

  return {
    isLoading,
    loadingStep,
    loadingProgress,
    startLoading,
    finishLoading,
    setStep
  };
};

export default useAppLoading;