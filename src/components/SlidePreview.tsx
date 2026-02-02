'use client';

import { Slide } from '@/lib/types';

interface SlidePreviewProps {
  slide: Slide;
  isSelected?: boolean;
  isThumbnail?: boolean;
  onClick?: () => void;
}

export default function SlidePreview({ slide, isSelected, isThumbnail, onClick }: SlidePreviewProps) {
  const baseClasses = isThumbnail
    ? 'w-full aspect-[16/9] rounded border cursor-pointer transition-all'
    : 'w-full aspect-[16/9] rounded-lg border';

  const selectedClasses = isSelected
    ? 'border-[var(--mol-red)] ring-2 ring-[var(--mol-red)]/20'
    : 'border-[var(--border-default)] hover:border-[var(--slate-300)]';

  return (
    <div className={`${baseClasses} ${selectedClasses} bg-white overflow-hidden`} onClick={onClick}>
      <div className={`h-full flex flex-col ${isThumbnail ? 'p-2' : 'p-6'}`}>
        {slide.type === 'title' && <TitleSlide slide={slide} isThumbnail={isThumbnail} />}
        {slide.type === 'content' && <ContentSlide slide={slide} isThumbnail={isThumbnail} />}
        {slide.type === 'chart' && <ChartSlide slide={slide} isThumbnail={isThumbnail} />}
        {slide.type === 'table' && <TableSlide slide={slide} isThumbnail={isThumbnail} />}
        {slide.type === 'two-column' && <TwoColumnSlide slide={slide} isThumbnail={isThumbnail} />}
      </div>
    </div>
  );
}

function TitleSlide({ slide, isThumbnail }: { slide: Slide; isThumbnail?: boolean }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      {/* MOL accent bar */}
      <div className={`bg-[var(--mol-red)] ${isThumbnail ? 'w-8 h-0.5 mb-2' : 'w-16 h-1 mb-4'}`} />
      <h1 className={`font-semibold text-[var(--text-primary)] ${isThumbnail ? 'text-[8px]' : 'text-2xl'}`}>
        {slide.title}
      </h1>
      {slide.subtitle && (
        <p className={`text-[var(--text-secondary)] mt-1 ${isThumbnail ? 'text-[6px]' : 'text-base'}`}>
          {slide.subtitle}
        </p>
      )}
    </div>
  );
}

function ContentSlide({ slide, isThumbnail }: { slide: Slide; isThumbnail?: boolean }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className={`flex items-center gap-2 ${isThumbnail ? 'mb-1' : 'mb-4'}`}>
        <div className={`bg-[var(--mol-red)] ${isThumbnail ? 'w-0.5 h-2' : 'w-1 h-6'}`} />
        <h2 className={`font-semibold text-[var(--text-primary)] ${isThumbnail ? 'text-[7px]' : 'text-lg'}`}>
          {slide.title}
        </h2>
      </div>
      {slide.subtitle && (
        <p className={`text-[var(--text-secondary)] ${isThumbnail ? 'text-[5px] mb-1' : 'text-sm mb-3'}`}>
          {slide.subtitle}
        </p>
      )}
      <ul className={`space-y-1 ${isThumbnail ? 'text-[5px]' : 'text-sm'}`}>
        {slide.content?.slice(0, isThumbnail ? 3 : undefined).map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[var(--text-secondary)]">
            <span className="text-[var(--mol-red)] flex-shrink-0">•</span>
            <span className={isThumbnail ? 'line-clamp-1' : ''}>{item}</span>
          </li>
        ))}
        {isThumbnail && slide.content && slide.content.length > 3 && (
          <li className="text-[var(--text-tertiary)]">...</li>
        )}
      </ul>
    </div>
  );
}

function ChartSlide({ slide, isThumbnail }: { slide: Slide; isThumbnail?: boolean }) {
  const maxValue = Math.max(...(slide.chartData?.values || [1]));

  return (
    <div className="flex-1 flex flex-col">
      <div className={`flex items-center gap-2 ${isThumbnail ? 'mb-1' : 'mb-4'}`}>
        <div className={`bg-[var(--mol-red)] ${isThumbnail ? 'w-0.5 h-2' : 'w-1 h-6'}`} />
        <h2 className={`font-semibold text-[var(--text-primary)] ${isThumbnail ? 'text-[7px]' : 'text-lg'}`}>
          {slide.title}
        </h2>
      </div>
      {slide.subtitle && (
        <p className={`text-[var(--text-tertiary)] ${isThumbnail ? 'text-[5px] mb-1' : 'text-xs mb-2'}`}>
          {slide.subtitle}
        </p>
      )}
      {/* Simple bar chart */}
      <div className={`flex-1 flex items-end ${isThumbnail ? 'gap-1' : 'gap-3'}`}>
        {slide.chartData?.values.map((value, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-[var(--mol-red)] rounded-t"
              style={{ height: `${(value / maxValue) * (isThumbnail ? 30 : 120)}px` }}
            />
            <span className={`text-[var(--text-tertiary)] mt-1 ${isThumbnail ? 'text-[4px]' : 'text-[10px]'}`}>
              {slide.chartData?.labels[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableSlide({ slide, isThumbnail }: { slide: Slide; isThumbnail?: boolean }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className={`flex items-center gap-2 ${isThumbnail ? 'mb-1' : 'mb-4'}`}>
        <div className={`bg-[var(--mol-red)] ${isThumbnail ? 'w-0.5 h-2' : 'w-1 h-6'}`} />
        <h2 className={`font-semibold text-[var(--text-primary)] ${isThumbnail ? 'text-[7px]' : 'text-lg'}`}>
          {slide.title}
        </h2>
      </div>
      <div className="flex-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className={`border-b border-[var(--border-default)] ${isThumbnail ? 'text-[4px]' : 'text-xs'}`}>
              {slide.tableData?.headers.map((header, i) => (
                <th key={i} className="text-left font-medium text-[var(--text-secondary)] pb-1 pr-2">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={isThumbnail ? 'text-[4px]' : 'text-xs'}>
            {slide.tableData?.rows.slice(0, isThumbnail ? 2 : undefined).map((row, i) => (
              <tr key={i} className="border-b border-[var(--border-subtle)]">
                {row.map((cell, j) => (
                  <td key={j} className="py-1 pr-2 text-[var(--text-primary)]">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TwoColumnSlide({ slide, isThumbnail }: { slide: Slide; isThumbnail?: boolean }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className={`flex items-center gap-2 ${isThumbnail ? 'mb-1' : 'mb-4'}`}>
        <div className={`bg-[var(--mol-red)] ${isThumbnail ? 'w-0.5 h-2' : 'w-1 h-6'}`} />
        <h2 className={`font-semibold text-[var(--text-primary)] ${isThumbnail ? 'text-[7px]' : 'text-lg'}`}>
          {slide.title}
        </h2>
      </div>
      <div className={`flex-1 grid grid-cols-2 ${isThumbnail ? 'gap-1' : 'gap-6'}`}>
        <div className={isThumbnail ? 'text-[4px]' : 'text-sm'}>
          {slide.leftContent?.map((item, i) => (
            <p key={i} className={`text-[var(--text-secondary)] ${i === 0 ? 'font-medium text-[var(--text-primary)]' : ''}`}>
              {item}
            </p>
          ))}
        </div>
        <div className={isThumbnail ? 'text-[4px]' : 'text-sm'}>
          {slide.rightContent?.map((item, i) => (
            <p key={i} className={`text-[var(--text-secondary)] ${i === 0 ? 'font-medium text-[var(--text-primary)]' : ''}`}>
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
