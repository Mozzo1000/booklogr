import { useState } from 'react';
import { Badge, Tooltip } from 'flowbite-react';
import { RiDoubleQuotesR, RiStickyNoteLine, RiBookOpenLine, RiShareLine, RiCheckLine } from 'react-icons/ri';
import { Img } from 'react-image';
import { useThemeMode } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../DateFormat';
import Skeleton from 'react-loading-skeleton';

function NotesFeedItem({ id, content, quotePage, date, bookTitle, bookIsbn, bookAuthor }) {
    const [copied, setCopied] = useState(false);
    const theme = useThemeMode();
    const { t } = useTranslation();

    const isQuote = quotePage && quotePage > 0;

    const handleShare = async () => {
        let text = isQuote
            ? `"${content}" — ${bookTitle}${bookAuthor ? ` by ${bookAuthor}` : ''}, p. ${quotePage}`
            : `${content} — ${bookTitle}${bookAuthor ? ` by ${bookAuthor}` : ''}`;

        try {
            if (navigator.share) {
                await navigator.share({ text });
            } else {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (err) {
            console.error('Share failed:', err);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-5 bg-white border border-gray-200 rounded-lg shadow dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isQuote ? (
                        <RiDoubleQuotesR size={18} className="dark:text-white shrink-0" />
                    ) : (
                        <RiStickyNoteLine size={18} className="dark:text-white shrink-0" />
                    )}
                    <Badge color="dark">
                        {isQuote ? t('notes.quote') : t('notes.note')}
                    </Badge>
                </div>
                <Tooltip content={copied ? t('profile.notes_feed.copied') : t('profile.notes_feed.share_note')}>
                    <button
                        onClick={handleShare}
                        className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
                        aria-label={t('profile.notes_feed.share_note')}
                    >
                        {copied ? (
                            <RiCheckLine size={18} className="text-green-500" />
                        ) : (
                            <RiShareLine size={18} />
                        )}
                    </button>
                </Tooltip>
            </div>

            <p className={`text-gray-800 dark:text-gray-100 text-base leading-relaxed ${isQuote ? 'italic' : ''}`}>
                {isQuote ? `"${content}"` : content}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-700">
                <Link to={`/books/${bookIsbn}`} className="flex items-center gap-3 group min-w-0">
                    <div className="shrink-0">
                        <Img
                            crossOrigin="anonymous"
                            className="w-8 h-12 object-cover rounded shadow-sm"
                            src={`https://covers.openlibrary.org/b/isbn/${bookIsbn}-S.jpg?default=false`}
                            loader={<Skeleton count={1} width={32} height={48} borderRadius={4} inline={true} />}
                            unloader={
                                theme.mode === 'dark'
                                    ? <img className="w-8 h-12 object-cover rounded shadow-sm" src="/fallback-cover-light.svg" />
                                    : <img className="w-8 h-12 object-cover rounded shadow-sm" src="/fallback-cover.svg" />
                            }
                        />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:underline truncate">{bookTitle}</p>
                        {bookAuthor && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{bookAuthor}</p>
                        )}
                        {isQuote && (
                            <div className="flex items-center gap-1 mt-0.5">
                                <RiBookOpenLine size={12} className="text-gray-400 shrink-0" />
                                <p className="text-xs text-gray-400">{t('notes.page')} {quotePage}</p>
                            </div>
                        )}
                    </div>
                </Link>
                <p className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">
                    {date ? formatDate(new Date(date)) : ''}
                </p>
            </div>
        </div>
    );
}

export default NotesFeedItem;
