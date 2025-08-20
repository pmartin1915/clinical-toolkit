import { useState, useEffect } from 'react';
import { Type, Minus, Plus, RotateCcw, Settings, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const AccessibilityControls = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState('normal');
  const [highContrast, setHighContrast] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    // Load saved preferences
    const savedFontSize = localStorage.getItem('clinical-toolkit-font-size') || 'normal';
    const savedContrast = localStorage.getItem('clinical-toolkit-high-contrast') === 'true';
    
    setFontSize(savedFontSize);
    setHighContrast(savedContrast);
    
    // Apply settings
    applyFontSize(savedFontSize);
    applyHighContrast(savedContrast);
  }, []);

  const applyFontSize = (size: string) => {
    const root = document.documentElement;
    root.classList.remove('font-small', 'font-normal', 'font-large', 'font-extra-large');
    root.classList.add(`font-${size}`);
  };

  const applyHighContrast = (enabled: boolean) => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  };

  const handleFontSizeChange = (newSize: string) => {
    setFontSize(newSize);
    localStorage.setItem('clinical-toolkit-font-size', newSize);
    applyFontSize(newSize);
  };

  const handleContrastToggle = () => {
    const newContrast = !highContrast;
    setHighContrast(newContrast);
    localStorage.setItem('clinical-toolkit-high-contrast', newContrast.toString());
    applyHighContrast(newContrast);
  };

  const resetSettings = () => {
    handleFontSizeChange('normal');
    setHighContrast(false);
    localStorage.setItem('clinical-toolkit-high-contrast', 'false');
    applyHighContrast(false);
  };

  const fontSizes = [
    { id: 'small', label: 'Small', size: 'text-sm' },
    { id: 'normal', label: 'Normal', size: 'text-base' },
    { id: 'large', label: 'Large', size: 'text-lg' },
    { id: 'extra-large', label: 'Extra Large', size: 'text-xl' }
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-gray-800 dark:bg-gray-700 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors z-[9999]"
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
        data-tour="accessibility"
      >
        <Settings className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-72 z-[9999]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Type className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Accessibility</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close accessibility settings"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        {/* Font Size Controls */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Text Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            {fontSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => handleFontSizeChange(size.id)}
                className={`p-2 text-xs border rounded-lg transition-colors ${
                  fontSize === size.id
                    ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-900 dark:border-primary-600 dark:text-primary-300'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <span className={size.size}>{size.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Font Size Buttons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Quick Adjust
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const sizes = ['small', 'normal', 'large', 'extra-large'];
                const currentIndex = sizes.indexOf(fontSize);
                if (currentIndex > 0) {
                  handleFontSizeChange(sizes[currentIndex - 1]);
                }
              }}
              disabled={fontSize === 'small'}
              className="flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Decrease text size"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <span className="flex-1 text-center text-sm text-gray-600 dark:text-gray-400">
              {fontSizes.find(s => s.id === fontSize)?.label}
            </span>
            
            <button
              onClick={() => {
                const sizes = ['small', 'normal', 'large', 'extra-large'];
                const currentIndex = sizes.indexOf(fontSize);
                if (currentIndex < sizes.length - 1) {
                  handleFontSizeChange(sizes[currentIndex + 1]);
                }
              }}
              disabled={fontSize === 'extra-large'}
              className="flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Increase text size"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color Theme
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'light', label: 'Light', icon: Sun },
              { id: 'dark', label: 'Dark', icon: Moon },
              { id: 'system', label: 'System', icon: Monitor }
            ].map((themeOption) => {
              const Icon = themeOption.icon;
              return (
                <button
                  key={themeOption.id}
                  onClick={() => setTheme(themeOption.id as any)}
                  className={`p-2 text-xs border rounded-lg transition-colors flex flex-col items-center space-y-1 ${
                    theme === themeOption.id
                      ? 'bg-primary-100 border-primary-300 text-primary-700 dark:bg-primary-900 dark:border-primary-600 dark:text-primary-300'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{themeOption.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* High Contrast Toggle */}
        <div>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={highContrast}
              onChange={handleContrastToggle}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              High Contrast Mode
            </span>
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Increases contrast for better readability
          </p>
        </div>

        {/* Reset Button */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={resetSettings}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to defaults</span>
          </button>
        </div>
      </div>
    </div>
  );
};