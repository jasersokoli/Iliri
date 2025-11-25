import { useState, useEffect, useMemo } from 'react';
import { useDataStore } from '../../store/dataStore';
import Modal from '../Modal';
import AddArticle from './AddArticle';
import './ArticlesList.css';

interface ArticlesListProps {
  onClose: () => void;
  onSelectArticle: (id: string) => void;
}

type FilterType = 'Active' | 'Deleted' | 'All';

export default function ArticlesList({ onClose, onSelectArticle }: ArticlesListProps) {
  const { articles, refreshAnalytics } = useDataStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('Active');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingField, setEditingField] = useState<{ id: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    refreshAnalytics();
  }, [articles, refreshAnalytics]);

  const filteredArticles = useMemo(() => {
    let filtered = articles;

    // Apply filter
    if (filter === 'Active') {
      filtered = filtered.filter((a) => a.active && !a.deleted);
    } else if (filter === 'Deleted') {
      filtered = filtered.filter((a) => a.deleted);
    }

    // Apply search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [articles, filter, search]);

  const handleEditField = (id: string, field: string, currentValue: string | number) => {
    setEditingField({ id, field });
    setEditValue(String(currentValue));
  };

  const handleSaveEdit = (id: string, field: string) => {
    const { updateArticle } = useDataStore.getState();
    const article = articles.find((a) => a.id === id);
    if (!article) return;

    let newValue: number | string = editValue;
    if (['cost', 'price1', 'price2', 'price3', 'currentStock', 'minimumStock'].includes(field)) {
      newValue = parseFloat(editValue) || 0;
      if (isNaN(newValue as number) || newValue < 0) return;
    }

    updateArticle(id, { [field]: newValue });
    setEditingField(null);
    setEditValue('');
  };

  const isLowStock = (article: typeof articles[0]) => {
    return article.minimumStock !== undefined && article.currentStock <= article.minimumStock;
  };

  return (
    <>
      <Modal isOpen={true} onClose={onClose} size="large" title="List of Articles">
        <div className="articles-list">
          <div className="articles-list-header">
            <div className="articles-search-container">
              <input
                type="text"
                className="articles-search"
                placeholder="Search by article name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="articles-filters">
                <button
                  className={`articles-filter-btn ${filter === 'All' ? 'active' : ''}`}
                  onClick={() => setFilter('All')}
                >
                  All
                </button>
                <button
                  className={`articles-filter-btn ${filter === 'Active' ? 'active' : ''}`}
                  onClick={() => setFilter('Active')}
                >
                  Active
                </button>
                <button
                  className={`articles-filter-btn ${filter === 'Deleted' ? 'active' : ''}`}
                  onClick={() => setFilter('Deleted')}
                >
                  Deleted
                </button>
              </div>
            </div>
            <button
              className="articles-add-btn"
              onClick={() => setShowAddModal(true)}
            >
              Add New Article
            </button>
            <button
              className="articles-print-btn"
              onClick={() => window.print()}
            >
              🖨️ Print
            </button>
          </div>

          <div className="articles-table-container">
            <table className="articles-table">
              <thead>
                <tr>
                  <th style={{ width: '200px' }}>Article</th>
                  <th style={{ width: '120px' }}>Current Stock</th>
                  <th style={{ width: '120px' }}>Minimum Stock</th>
                  <th style={{ width: '120px' }}>Cost</th>
                  <th style={{ width: '120px' }}>Price 1</th>
                  <th style={{ width: '120px' }}>Price 2</th>
                  <th style={{ width: '120px' }}>Price 3</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="articles-empty">
                      No articles found
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => (
                    <tr
                      key={article.id}
                      className={`articles-row ${isLowStock(article) ? 'low-stock' : ''} ${selectedArticleId === article.id ? 'selected' : ''}`}
                      onClick={() => setSelectedArticleId(article.id)}
                      onDoubleClick={() => {
                        setSelectedArticleId(article.id);
                        onSelectArticle(article.id);
                      }}
                    >
                      <td>{article.name}</td>
                      <td
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleEditField(article.id, 'currentStock', article.currentStock);
                        }}
                      >
                        {editingField?.id === article.id && editingField?.field === 'currentStock' ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleSaveEdit(article.id, 'currentStock')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(article.id, 'currentStock');
                              } else if (e.key === 'Escape') {
                                setEditingField(null);
                                setEditValue('');
                              }
                            }}
                            autoFocus
                            className="articles-inline-input"
                          />
                        ) : (
                          article.currentStock
                        )}
                      </td>
                      <td
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleEditField(article.id, 'minimumStock', article.minimumStock || 0);
                        }}
                      >
                        {editingField?.id === article.id && editingField?.field === 'minimumStock' ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleSaveEdit(article.id, 'minimumStock')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(article.id, 'minimumStock');
                              } else if (e.key === 'Escape') {
                                setEditingField(null);
                                setEditValue('');
                              }
                            }}
                            autoFocus
                            className="articles-inline-input"
                          />
                        ) : (
                          article.minimumStock ?? '-'
                        )}
                      </td>
                      <td
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleEditField(article.id, 'cost', article.cost);
                        }}
                      >
                        {editingField?.id === article.id && editingField?.field === 'cost' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleSaveEdit(article.id, 'cost')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(article.id, 'cost');
                              } else if (e.key === 'Escape') {
                                setEditingField(null);
                                setEditValue('');
                              }
                            }}
                            autoFocus
                            className="articles-inline-input"
                          />
                        ) : (
                          `$${article.cost.toFixed(2)}`
                        )}
                      </td>
                      <td
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleEditField(article.id, 'price1', article.price1);
                        }}
                      >
                        {editingField?.id === article.id && editingField?.field === 'price1' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleSaveEdit(article.id, 'price1')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(article.id, 'price1');
                              } else if (e.key === 'Escape') {
                                setEditingField(null);
                                setEditValue('');
                              }
                            }}
                            autoFocus
                            className="articles-inline-input"
                          />
                        ) : (
                          `$${article.price1.toFixed(2)}`
                        )}
                      </td>
                      <td
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleEditField(article.id, 'price2', article.price2 || 0);
                        }}
                      >
                        {editingField?.id === article.id && editingField?.field === 'price2' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleSaveEdit(article.id, 'price2')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(article.id, 'price2');
                              } else if (e.key === 'Escape') {
                                setEditingField(null);
                                setEditValue('');
                              }
                            }}
                            autoFocus
                            className="articles-inline-input"
                          />
                        ) : (
                          article.price2 ? `$${article.price2.toFixed(2)}` : '-'
                        )}
                      </td>
                      <td
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleEditField(article.id, 'price3', article.price3 || 0);
                        }}
                      >
                        {editingField?.id === article.id && editingField?.field === 'price3' ? (
                          <input
                            type="number"
                            step="0.01"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => handleSaveEdit(article.id, 'price3')}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(article.id, 'price3');
                              } else if (e.key === 'Escape') {
                                setEditingField(null);
                                setEditValue('');
                              }
                            }}
                            autoFocus
                            className="articles-inline-input"
                          />
                        ) : (
                          article.price3 ? `$${article.price3.toFixed(2)}` : '-'
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {showAddModal && (
        <AddArticle
          articleId={null}
          onClose={() => {
            setShowAddModal(false);
          }}
          onBack={() => {
            setShowAddModal(false);
          }}
        />
      )}
    </>
  );
}

