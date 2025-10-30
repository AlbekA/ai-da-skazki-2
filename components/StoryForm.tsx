import React, { useState } from 'react';

// Fix: Define and export UserStatus type used in App.tsx
export type UserStatus = 'guest' | 'registered' | 'subscribed' | 'owner';

// Fix: Define and export StoryFormData interface used across the application
export interface StoryFormData {
  name: string;
  character: string;
  location: string;
  isInteractive: boolean;
  voiceId: string;
}

interface StoryFormProps {
  onSubmit: (formData: StoryFormData) => void;
  isLoading: boolean;
  userStatus: UserStatus;
}

const VOICES = [
    { id: 'Kore', name: 'Женский голос 1 (Кора)' },
    { id: 'Puck', name: 'Мужской голос 1 (Пак)' },
    { id: 'Charon', name: 'Женский голос 2 (Харон)' },
    { id: 'Fenrir', name: 'Мужской голос 2 (Фенрир)' },
    { id: 'Zephyr', name: 'Женский голос 3 (Зефир)' },
];

// Fix: Implement the StoryForm component
export const StoryForm: React.FC<StoryFormProps> = ({ onSubmit, isLoading, userStatus }) => {
  const [name, setName] = useState('');
  const [character, setCharacter] = useState('');
  const [location, setLocation] = useState('');
  const [isInteractive, setIsInteractive] = useState(false);
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [error, setError] = useState<string | null>(null);

  const isPremiumFeature = userStatus === 'guest' || userStatus === 'registered';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !character.trim() || !location.trim()) {
      setError('Пожалуйста, заполните все поля, чтобы начать волшебство!');
      return;
    }
    setError(null);
    onSubmit({
      name,
      character,
      location,
      isInteractive,
      voiceId,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
          Заполните анкету сказки
        </h2>
        <p className="text-slate-400 mt-2">
          Дайте волю воображению и создайте уникальную историю!
        </p>
      </div>
      
      {error && <p className="text-red-400 text-center font-semibold bg-red-900/20 p-3 rounded-md">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-1">
          <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
            Имя ребенка
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-700 border-slate-600 text-slate-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="Например, Аня"
          />
        </div>
        <div className="col-span-1">
          <label htmlFor="character" className="block text-sm font-medium text-slate-300 mb-1">
            Главный герой
          </label>
          <input
            type="text"
            id="character"
            value={character}
            onChange={(e) => setCharacter(e.target.value)}
            className="w-full bg-slate-700 border-slate-600 text-slate-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="Например, храбрый котенок"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-slate-300 mb-1">
          Место действия
        </label>
        <input
          type="text"
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full bg-slate-700 border-slate-600 text-slate-200 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
          placeholder="Например, в заколдованном лесу"
        />
      </div>

      <div>
        <label htmlFor="voice" className="block text-sm font-medium text-slate-300 mb-2">
          Голос диктора
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {VOICES.map(voice => (
                <button
                    type="button"
                    key={voice.id}
                    onClick={() => setVoiceId(voice.id)}
                    className={`text-sm p-3 rounded-md transition-all border-2 ${voiceId === voice.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-700 border-slate-600 hover:bg-slate-600'}`}
                >
                    {voice.name}
                </button>
            ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg">
        <div>
          <label htmlFor="isInteractive" className="font-medium text-slate-200">
            Интерактивная сказка
          </label>
          <p className="text-sm text-slate-400">
            Ребенок сможет влиять на сюжет, делая выбор.
          </p>
        </div>
        <div className="relative group">
          <button
            type="button"
            id="isInteractive"
            onClick={() => !isPremiumFeature && setIsInteractive(!isInteractive)}
            disabled={isPremiumFeature}
            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 ${isInteractive ? 'bg-indigo-600' : 'bg-slate-600'} ${isPremiumFeature ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-pressed={isInteractive}
          >
            <span
              aria-hidden="true"
              className={`${isInteractive ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
            />
          </button>
          {isPremiumFeature && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Доступно по подписке
              </div>
          )}
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-wait transition-all duration-300 transform hover:scale-105"
      >
        {isLoading ? (
            <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Создаем волшебство...
            </>
        ) : (
          'Создать сказку'
        )}
      </button>
    </form>
  );
};
