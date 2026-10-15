import React, { useState } from 'react';
import { Tag, Plus, Edit2, Trash2, X, Award } from 'lucide-react';
import { Category } from '../../types';

interface CategoryManagerProps {
  categories: Category[];
  onSaveCategory: (c: Partial<Category>) => Category;
  onDeleteCategory: (id: string) => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);

  const handleCreateNew = () => {
    setEditingCat({
      Name: '',
      Code: '',
      Description: '',
      JudgesRequired: 1,
      RankingScope: 'both',
      Prize: 'Gold Trophy + GMU Scholarship',
      TieBreak: 'Creativity / Innovation Score',
      Status: 'Active',
    });
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat || !editingCat.Name) return;

    onSaveCategory(editingCat);
    setEditingCat(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E2E8E4] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#11241C]">
            Exhibition Categories ({categories.length})
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Academic streams scored with the standardized GMU 40-point rubric.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="px-4 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((c) => (
          <div
            key={c.CategoryID}
            className="bg-white rounded-3xl p-5 border border-[#E2E8E4] shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[11px] font-bold text-[#0B6E4F] bg-[#E6F1EC] px-2 py-0.5 rounded">
                  {c.Code || c.CategoryID}
                </span>
                <h3 className="font-bold text-base text-[#11241C] mt-1">{c.Name}</h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditingCat(c)}
                  className="p-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete category ${c.Name}?`)) onDeleteCategory(c.CategoryID);
                  }}
                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-600 line-clamp-2">
              {c.Description || 'No description provided.'}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E2E8E4] text-[#5B6E64]">
              <div>
                Judges Required: <strong>{c.JudgesRequired} per project</strong>
              </div>
              <div>
                Scope: <strong>{c.RankingScope || 'Category + Top 10'}</strong>
              </div>
            </div>

            {c.Prize && (
              <div className="flex items-center gap-1.5 text-xs text-[#B8860B] font-semibold bg-amber-50 p-2 rounded-xl border border-amber-200">
                <Award className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{c.Prize}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8E4]">
              <h3 className="font-bold text-base text-[#11241C]">
                {editingCat.CategoryID ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setEditingCat(null)} className="text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCat.Name || ''}
                  onChange={(e) => setEditingCat({ ...editingCat, Name: e.target.value })}
                  className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Code</label>
                  <input
                    type="text"
                    value={editingCat.Code || ''}
                    onChange={(e) => setEditingCat({ ...editingCat, Code: e.target.value.toUpperCase() })}
                    placeholder="e.g. SCI-RES"
                    className="w-full p-2.5 font-mono uppercase bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Judges Required</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editingCat.JudgesRequired || 1}
                    onChange={(e) =>
                      setEditingCat({ ...editingCat, JudgesRequired: parseInt(e.target.value) || 1 })
                    }
                    className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingCat.Description || ''}
                  onChange={(e) => setEditingCat({ ...editingCat, Description: e.target.value })}
                  className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Prize / Award</label>
                <input
                  type="text"
                  value={editingCat.Prize || ''}
                  onChange={(e) => setEditingCat({ ...editingCat, Prize: e.target.value })}
                  placeholder="Gold Trophy + Scholarship"
                  className="w-full p-2.5 bg-[#F6F8F7] border border-[#CBD7D0] rounded-xl outline-none"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#E2E8E4]">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0B6E4F] hover:bg-[#08533b] text-white font-bold rounded-xl shadow"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
