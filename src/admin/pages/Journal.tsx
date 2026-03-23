import { useState } from 'react';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { useJournal } from '../../store/JournalContext';
import type { JournalArticle } from '../../data/journal';

const categoryColors: { label: string; value: JournalArticle['categoryColor'] }[] = [
  { label: 'Зелёный', value: 'sage' },
  { label: 'Тёплый', value: 'warm' },
  { label: 'Нейтральный', value: 'neutral' },
];

const emptyForm = {
  id: '',
  category: '',
  categoryColor: 'sage' as JournalArticle['categoryColor'],
  title: '',
  excerpt: '',
  date: '',
  readTime: '',
  content: [''],
};

const Journal = () => {
  const { articles, addArticle, updateArticle, deleteArticle } = useJournal();
  const [editing, setEditing] = useState<typeof emptyForm | null>(null);
  const [isNew, setIsNew] = useState(false);

  const startCreate = () => {
    const today = new Date();
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const dateStr = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    setEditing({ ...emptyForm, date: dateStr });
    setIsNew(true);
  };

  const startEdit = (article: JournalArticle) => {
    setEditing({
      ...article,
      content: article.content.length > 0 ? article.content : [''],
    });
    setIsNew(false);
  };

  const cancel = () => {
    setEditing(null);
    setIsNew(false);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.title.trim() || !editing.category.trim()) return;

    const id = isNew
      ? editing.title.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/^-|-$/g, '') || `article-${Date.now()}`
      : editing.id;

    const article: JournalArticle = {
      id,
      category: editing.category.trim(),
      categoryColor: editing.categoryColor,
      title: editing.title.trim(),
      excerpt: editing.excerpt.trim(),
      date: editing.date.trim(),
      readTime: editing.readTime.trim() || '3 мин',
      content: editing.content.filter((p) => p.trim() !== ''),
    };

    if (isNew) {
      addArticle(article);
    } else {
      updateArticle(id, article);
    }

    setEditing(null);
    setIsNew(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить статью?')) {
      deleteArticle(id);
      if (editing?.id === id) {
        setEditing(null);
      }
    }
  };

  const updateContentParagraph = (index: number, value: string) => {
    if (!editing) return;
    const newContent = [...editing.content];
    newContent[index] = value;
    setEditing({ ...editing, content: newContent });
  };

  const addParagraph = () => {
    if (!editing) return;
    setEditing({ ...editing, content: [...editing.content, ''] });
  };

  const removeParagraph = (index: number) => {
    if (!editing || editing.content.length <= 1) return;
    const newContent = editing.content.filter((_, i) => i !== index);
    setEditing({ ...editing, content: newContent });
  };

  return (
    <>
      <Breadcrumb pageName="Журнал" />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Статьи ({articles.length})
          </h2>
          {!editing && (
            <button
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
            >
              <svg className="fill-current" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M15 7H9V1C9 0.4 8.6 0 8 0C7.4 0 7 0.4 7 1V7H1C0.4 7 0 7.4 0 8C0 8.6 0.4 9 1 9H7V15C7 15.6 7.4 16 8 16C8.6 16 9 15.6 9 15V9H15C15.6 9 16 8.6 16 8C16 7.4 15.6 7 15 7Z" fill="" />
              </svg>
              Добавить статью
            </button>
          )}
        </div>

        {/* Edit / Create form */}
        {editing && (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                {isNew ? 'Новая статья' : 'Редактирование статьи'}
              </h3>
            </div>
            <div className="p-6.5 flex flex-col gap-5">
              {/* Title */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                  Заголовок *
                </label>
                <input
                  type="text"
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  placeholder="Заголовок статьи"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              {/* Category + Color + Date + ReadTime */}
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Категория *
                  </label>
                  <input
                    type="text"
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    placeholder="Советы, Тренды, HoReCa..."
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Цвет категории
                  </label>
                  <div className="flex gap-2 pt-2">
                    {categoryColors.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setEditing({ ...editing, categoryColor: c.value })}
                        className={`rounded px-3 py-1.5 text-xs font-medium border transition ${
                          editing.categoryColor === c.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-stroke text-bodydark2 hover:border-primary dark:border-strokedark'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Дата
                  </label>
                  <input
                    type="text"
                    value={editing.date}
                    onChange={(e) => setEditing({ ...editing, date: e.target.value })}
                    placeholder="12 марта 2026"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Время чтения
                  </label>
                  <input
                    type="text"
                    value={editing.readTime}
                    onChange={(e) => setEditing({ ...editing, readTime: e.target.value })}
                    placeholder="5 мин"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                  Краткое описание
                </label>
                <textarea
                  value={editing.excerpt}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  placeholder="Краткое описание для карточки статьи"
                  rows={2}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                />
              </div>

              {/* Content paragraphs */}
              <div>
                <div className="mb-2.5 flex items-center justify-between">
                  <label className="block text-sm font-medium text-black dark:text-white">
                    Текст статьи (по абзацам)
                  </label>
                  <button
                    type="button"
                    onClick={addParagraph}
                    className="text-sm text-primary hover:underline"
                  >
                    + Добавить абзац
                  </button>
                </div>
                <div className="flex flex-col gap-3">
                  {editing.content.map((paragraph, i) => (
                    <div key={i} className="flex gap-2">
                      <textarea
                        value={paragraph}
                        onChange={(e) => updateContentParagraph(i, e.target.value)}
                        placeholder={`Абзац ${i + 1}`}
                        rows={3}
                        className="flex-1 rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                      />
                      {editing.content.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParagraph(i)}
                          className="self-start mt-3 text-meta-1 hover:text-red-700"
                          title="Удалить абзац"
                        >
                          <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
                            <path d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.67852V1.9969ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z" fill="" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancel}
                  className="rounded border border-stroke px-6 py-2 text-sm font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  Отмена
                </button>
                <button
                  onClick={save}
                  disabled={!editing.title.trim() || !editing.category.trim()}
                  className="rounded bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
                >
                  {isNew ? 'Создать' : 'Сохранить'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Articles list */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="grid grid-cols-12 border-b border-stroke px-4 py-4 dark:border-strokedark sm:px-6 2xl:px-7.5">
            <div className="col-span-5">
              <p className="font-medium text-sm">Заголовок</p>
            </div>
            <div className="col-span-2">
              <p className="font-medium text-sm">Категория</p>
            </div>
            <div className="col-span-2">
              <p className="font-medium text-sm">Дата</p>
            </div>
            <div className="col-span-1">
              <p className="font-medium text-sm">Чтение</p>
            </div>
            <div className="col-span-2">
              <p className="font-medium text-sm text-right">Действия</p>
            </div>
          </div>

          {articles.length === 0 && (
            <div className="px-4 py-10 text-center text-bodydark2 sm:px-6">
              Нет статей. Нажмите «Добавить статью» чтобы создать первую.
            </div>
          )}

          {articles.map((article) => (
            <div
              key={article.id}
              className="grid grid-cols-12 items-center border-b border-stroke px-4 py-4 dark:border-strokedark sm:px-6 2xl:px-7.5 last:border-b-0"
            >
              <div className="col-span-5">
                <p className="text-sm font-medium text-black dark:text-white line-clamp-1">
                  {article.title}
                </p>
                <p className="text-xs text-bodydark2 line-clamp-1 mt-0.5">
                  {article.excerpt}
                </p>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-bodydark2">{article.category}</span>
              </div>
              <div className="col-span-2">
                <span className="text-sm text-bodydark2">{article.date}</span>
              </div>
              <div className="col-span-1">
                <span className="text-sm text-bodydark2">{article.readTime}</span>
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <button
                  onClick={() => startEdit(article)}
                  className="hover:text-primary"
                  title="Редактировать"
                >
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
                    <path d="M13.7535 1.00627L12.1285 2.63127L15.3691 5.87189L16.9941 4.24689C17.4316 3.80939 17.4316 3.08752 16.9941 2.65002L15.3504 1.00627C14.9129 0.568774 14.191 0.568774 13.7535 1.00627ZM11.2816 3.47814L2.1941 12.5656C2.02285 12.7369 1.90723 12.9563 1.86348 13.1944L1.12598 17.0438C1.08223 17.2538 1.1541 17.4731 1.31035 17.6294C1.4666 17.7856 1.68598 17.8575 1.89598 17.8138L5.7441 17.0763C5.98223 17.0325 6.20348 16.9169 6.37285 16.7456L15.4604 7.65814L11.2816 3.47814Z" fill="" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  className="hover:text-meta-1"
                  title="Удалить"
                >
                  <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18">
                    <path d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.67852V1.9969ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z" fill="" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Journal;
