import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Send, FileText, Plus } from 'lucide-react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { resumeId: string; coverLetter: string; resumeFile?: File }) => void;
  resumes: Array<{ id: string; title: string }>;
}

const ApplicationModal = ({ isOpen, onClose, onSubmit, resumes }: ApplicationModalProps) => {
  const { t } = useTranslation();
  const [selectedResume, setSelectedResume] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      resumeId: selectedResume,
      coverLetter,
      ...(resumeFile && { resumeFile })
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      setResumeFile(file);
      setSelectedResume(''); // Clear selected profile resume when file is uploaded
    } else {
      alert('Please upload a DOC or DOCX file');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">
                {t('applications.modal.title')}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-300">
                  {t('applications.modal.selectResume')}
                </label>
                
                {/* Profile Resumes */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">{t('applications.modal.profileResumes')}</p>
                  <div className="grid grid-cols-2 gap-4">
                    {resumes.map((resume) => (
                      <button
                        key={resume.id}
                        type="button"
                        onClick={() => {
                          setSelectedResume(resume.id);
                          setResumeFile(null); // Clear uploaded file when profile resume is selected
                        }}
                        className={`flex items-center gap-2 p-4 rounded-lg border ${
                          selectedResume === resume.id
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-gray-600 hover:border-gray-500'
                        } transition-colors text-left`}
                      >
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <span className="text-white">{resume.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">{t('applications.modal.uploadResume')}</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".doc,.docx"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full flex items-center justify-center gap-2 p-4 rounded-lg border ${
                      resumeFile
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-gray-600 border-dashed hover:border-gray-500'
                    } transition-colors`}
                  >
                    {resumeFile ? (
                      <>
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <span className="text-white">{resumeFile.name}</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-400">{t('applications.modal.dropResume')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {t('applications.modal.coverLetter')}
                </label>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  required
                  rows={6}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  placeholder={t('applications.modal.coverLetterPlaceholder')}
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  {t('applications.modal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!((selectedResume || resumeFile) && coverLetter)}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {t('applications.modal.submit')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplicationModal;