import React from 'react';
import { BookOpen, CheckCircle2, Award, Clock } from 'lucide-react';
import { Rubric } from '../../types';

interface RubricViewerProps {
  rubric: Rubric;
}

export const RubricViewer: React.FC<RubricViewerProps> = ({ rubric }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B6E4F] bg-[#E6F1EC] px-2.5 py-1 rounded-md mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Official Rubric Specification</span>
          </div>
          <h2 className="text-xl font-black text-[#11241C]">{rubric.name}</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            4 standardized evaluation criteria • 10 marks maximum each • Total scale: 40 points.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F6F8F7] px-4 py-2.5 rounded-2xl border border-[#CBD7D0] flex-shrink-0">
          <Clock className="w-4 h-4 text-amber-600" />
          <span className="text-xs text-gray-700 font-medium">
            Time Penalty: <strong>-1 mark</strong> (Projects: 5 min, Posters: 3 min)
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {rubric.criteria.map((c, idx) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#0B6E4F] uppercase tracking-wider">
                  Criterion {idx + 1}
                </span>
                <h3 className="text-lg font-bold text-[#11241C] mt-0.5">{c.name}</h3>
              </div>
              <span className="text-xs font-mono font-bold bg-[#E6F1EC] text-[#0B6E4F] px-3 py-1 rounded-full">
                Max {c.max} Points
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F5F2] text-[#2C3F35] font-bold">
                  <tr>
                    <th className="py-2.5 px-3.5 w-24">Score Band</th>
                    <th className="py-2.5 px-3.5">Performance Descriptor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF3F0]">
                  {c.bands.map((b) => (
                    <tr key={b.label} className="hover:bg-[#F9FBFA]">
                      <td className="py-3 px-3.5 font-bold font-mono text-[#0B6E4F] whitespace-nowrap">
                        {b.label} marks
                      </td>
                      <td className="py-3 px-3.5 text-gray-700 leading-relaxed">{b.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
