import type { DependencyList } from 'react';
import { useEffect, useRef } from 'react';

/**
 * Хук, который работает как useEffect, но пропускает первый рендер
 * Полезно для эффектов, которые должны запускаться только при изменении зависимостей, а не при монтировании
 */
export function useUpdateEffect(
  effect: () => void | (() => void),
  dependencies: DependencyList = []
) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Пропускаем первый рендер
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Запускаем эффект при последующих рендерах
    return effect();
  }, dependencies);
} 