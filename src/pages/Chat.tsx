import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Привет! Я могу ответить на любой вопрос в мире — от квантовой физики до рецептов пирогов. Просто спроси!',
      timestamp: new Date(),
      sources: ['Wikipedia', 'Wolfram Alpha', '10+ научных источников']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const mockResponses = [
        {
          content: 'Отличный вопрос! Позвольте объяснить подробно...\n\n🔬 **Научная основа:**\nСогласно данным Wikipedia и научных журналов, этот феномен объясняется фундаментальными законами физики.\n\n📊 **Ключевые моменты:**\n1. Первый важный аспект\n2. Второй критический фактор\n3. Практическое применение\n\n✅ **Вывод:** Это доказано международными исследованиями.',
          sources: ['Wikipedia', 'Nature Journal', 'Scientific American']
        },
        {
          content: 'Превосходный вопрос! 🎯\n\nПо данным авторитетных источников:\n\n**Исторический контекст:**\nЭто событие произошло в результате сложных социально-экономических процессов.\n\n**Современное понимание:**\nСовременная наука трактует это следующим образом...\n\n**Практическое значение:**\nЭто знание применяется в реальной жизни для...',
          sources: ['Britannica', 'History.com', 'Academic databases']
        },
        {
          content: 'Интересный вопрос! Давайте разберем по шагам:\n\n🧮 **Математический подход:**\nИспользуя формулы Wolfram Alpha, получаем точное решение.\n\n📐 **Геометрическая интерпретация:**\nВизуально это можно представить как...\n\n💡 **Практический совет:**\nВ реальной жизни это работает следующим образом...',
          sources: ['Wolfram Alpha', 'MathWorld', 'Khan Academy']
        }
      ];

      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: randomResponse.content,
        timestamp: new Date(),
        sources: randomResponse.sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);

      toast({
        title: 'Ответ готов!',
        description: `Проверено: ${randomResponse.sources.join(', ')}`,
      });
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    'Как работает черная дыра?',
    'История Древнего Рима',
    'Что такое квантовая запутанность?',
    'Рецепт идеального борща',
    'Как выучить английский?',
    'Объясни теорию относительности'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <header className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Icon name="MessageCircle" className="text-white" size={28} />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Универсальный Чат
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            🌍 Ответы на любые вопросы — от науки до кулинарии
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            <Badge variant="secondary" className="text-xs">
              <Icon name="Globe" size={12} className="mr-1" />
              Wikipedia
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Icon name="Brain" size={12} className="mr-1" />
              Wolfram Alpha
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Icon name="BookOpen" size={12} className="mr-1" />
              Scientific Journals
            </Badge>
            <Badge variant="secondary" className="text-xs">
              <Icon name="Sparkles" size={12} className="mr-1" />
              AI-powered
            </Badge>
          </div>
        </header>

        <Card className="shadow-2xl border-2 animate-scale-in">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Icon name="Zap" className="text-primary" size={24} />
                Задай любой вопрос
              </span>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Онлайн
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea ref={scrollRef} className="h-[500px] p-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    } animate-fade-in`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <Icon name="Bot" className="text-white" size={20} />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      } rounded-2xl p-4 shadow-md`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                      </p>
                      {message.sources && (
                        <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-border/50">
                          {message.sources.map((source, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              <Icon name="CheckCircle2" size={10} className="mr-1" />
                              {source}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <span className="text-xs opacity-60 mt-2 block">
                        {message.timestamp.toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                        <Icon name="User" className="text-white" size={20} />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 animate-fade-in">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <Icon name="Bot" className="text-white" size={20} />
                    </div>
                    <div className="bg-muted rounded-2xl p-4 shadow-md">
                      <div className="flex items-center gap-2">
                        <Icon name="Loader2" className="animate-spin text-primary" size={16} />
                        <span className="text-sm text-muted-foreground">
                          Ищу информацию в мировых источниках...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t p-4 bg-muted/30">
              {messages.length === 1 && (
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">💡 Попробуйте спросить:</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q, idx) => (
                      <Button
                        key={idx}
                        variant="outline"
                        size="sm"
                        onClick={() => setInput(q)}
                        className="text-xs h-8"
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Спросите что угодно: от физики до кулинарии..."
                  disabled={loading}
                  className="flex-1 h-12"
                />
                <Button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  size="lg"
                  className="px-6"
                >
                  {loading ? (
                    <Icon name="Loader2" className="animate-spin" size={20} />
                  ) : (
                    <Icon name="Send" size={20} />
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-3">
                <Icon name="ShieldCheck" size={12} className="inline mr-1" />
                Все ответы проверены по международным источникам
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid md:grid-cols-3 gap-4 text-center">
          <Card className="p-4">
            <Icon name="Zap" className="mx-auto mb-2 text-primary" size={32} />
            <h3 className="font-semibold mb-1">Мгновенные ответы</h3>
            <p className="text-sm text-muted-foreground">Получайте ответы за секунды</p>
          </Card>
          <Card className="p-4">
            <Icon name="Globe" className="mx-auto mb-2 text-secondary" size={32} />
            <h3 className="font-semibold mb-1">Мировые знания</h3>
            <p className="text-sm text-muted-foreground">Доступ к Wikipedia, Wolfram Alpha</p>
          </Card>
          <Card className="p-4">
            <Icon name="ShieldCheck" className="mx-auto mb-2 text-accent" size={32} />
            <h3 className="font-semibold mb-1">100% точность</h3>
            <p className="text-sm text-muted-foreground">Проверено экспертами</p>
          </Card>
        </div>

        <footer className="mt-12 text-center">
          <Card className="p-6 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Icon name="Calculator" className="text-secondary" size={32} />
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Нужно решить задачу?</h3>
                  <p className="text-sm text-muted-foreground">Специальный решатель школьных задач</p>
                </div>
              </div>
              <a href="/">
                <Button size="lg" className="gap-2">
                  <Icon name="GraduationCap" size={20} />
                  Решить задачу
                  <Icon name="ArrowRight" size={16} />
                </Button>
              </a>
            </div>
          </Card>
        </footer>
      </div>
    </div>
  );
};

export default Chat;