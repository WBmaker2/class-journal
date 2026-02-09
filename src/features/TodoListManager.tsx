import React, { useState } from 'react';
import { useJournal } from '../context/JournalContext';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Plus, CheckCircle, Circle, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { TodoItem } from '../types';

export const TodoListManager: React.FC = () => {
  const { todos, updateTodos, currentDate } = useJournal();
  const [newTodo, setNewTodo] = useState('');

  // Filter todos for the selected date
  const filteredTodos = todos.filter(todo => todo.dueDate === currentDate);

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todo: TodoItem = {
      id: Date.now().toString(),
      content: newTodo,
      completed: false,
      dueDate: currentDate // Use selected date
    };

    updateTodos([...todos, todo]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    updateTodos(updated);
  };

  const deleteTodo = (id: string) => {
    const updated = todos.filter(t => t.id !== id);
    updateTodos(updated);
  };

  const handleMoveUp = (id: string) => {
    const index = filteredTodos.findIndex(t => t.id === id);
    if (index <= 0) return;

    const currentTodo = filteredTodos[index];
    const prevTodo = filteredTodos[index - 1];

    const globalIndexCurrent = todos.findIndex(t => t.id === currentTodo.id);
    const globalIndexPrev = todos.findIndex(t => t.id === prevTodo.id);

    if (globalIndexCurrent === -1 || globalIndexPrev === -1) return;

    const newTodos = [...todos];
    // Swap
    [newTodos[globalIndexCurrent], newTodos[globalIndexPrev]] = [newTodos[globalIndexPrev], newTodos[globalIndexCurrent]];
    updateTodos(newTodos);
  };

  const handleMoveDown = (id: string) => {
    const index = filteredTodos.findIndex(t => t.id === id);
    if (index === -1 || index >= filteredTodos.length - 1) return;

    const currentTodo = filteredTodos[index];
    const nextTodo = filteredTodos[index + 1];

    const globalIndexCurrent = todos.findIndex(t => t.id === currentTodo.id);
    const globalIndexNext = todos.findIndex(t => t.id === nextTodo.id);

    if (globalIndexCurrent === -1 || globalIndexNext === -1) return;

    const newTodos = [...todos];
    // Swap
    [newTodos[globalIndexCurrent], newTodos[globalIndexNext]] = [newTodos[globalIndexNext], newTodos[globalIndexCurrent]];
    updateTodos(newTodos);
  };

  return (
    <Card className="h-full">
      <CardHeader title="할 일 목록" subtitle={`${currentDate} 업무를 관리하세요`} />
      <CardContent>
        <form onSubmit={handleAddTodo} className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="새로운 할 일 추가..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
          </button>
        </form>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredTodos.length === 0 ? (
            <p className="text-center text-gray-400 py-4 text-sm">등록된 할 일이 없습니다.</p>
          ) : (
            filteredTodos.map((todo, index) => (
              <div 
                key={todo.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  todo.completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button 
                    onClick={() => toggleTodo(todo.id)}
                    className={`transition-colors ${
                      todo.completed ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'
                    }`}
                  >
                    {todo.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                  </button>
                  <span className={`text-sm ${todo.completed ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {todo.content}
                  </span>
                </div>
                
                <div className="flex items-center gap-1">
                  <div className="flex flex-col gap-0.5 mr-2">
                    <button 
                      onClick={() => handleMoveUp(todo.id)}
                      disabled={index === 0}
                      className={`p-0.5 rounded transition-colors ${
                        index === 0 
                          ? 'text-gray-200 cursor-not-allowed' 
                          : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
                      }`}
                      title="위로 이동"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button 
                      onClick={() => handleMoveDown(todo.id)}
                      disabled={index === filteredTodos.length - 1}
                      className={`p-0.5 rounded transition-colors ${
                        index === filteredTodos.length - 1 
                          ? 'text-gray-200 cursor-not-allowed' 
                          : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
                      }`}
                      title="아래로 이동"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
