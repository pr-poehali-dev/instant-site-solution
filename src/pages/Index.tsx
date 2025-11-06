import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Solution {
  id: string;
  subject: string;
  question: string;
  answer: string;
  steps: string[];
  timestamp: Date;
}

const Index = () => {
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('math');
  const [loading, setLoading] = useState(false);
  const [currentSolution, setCurrentSolution] = useState<Solution | null>(null);
  const [history, setHistory] = useState<Solution[]>([]);
  const { toast } = useToast();

  const subjects = [
    { value: 'math', label: 'Математика', icon: 'Calculator', color: 'bg-primary' },
    { value: 'physics', label: 'Физика', icon: 'Atom', color: 'bg-secondary' },
    { value: 'chemistry', label: 'Химия', icon: 'Flask', color: 'bg-accent' },
    { value: 'russian', label: 'Русский язык', icon: 'BookOpen', color: 'bg-primary' },
    { value: 'literature', label: 'Литература', icon: 'Book', color: 'bg-secondary' },
    { value: 'biology', label: 'Биология', icon: 'Leaf', color: 'bg-accent' },
  ];

  const handleSolve = async () => {
    if (!question.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, введите условие задачи',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    
    setTimeout(() => {
      const mockSolution: Solution = {
        id: Date.now().toString(),
        subject: subjects.find(s => s.value === subject)?.label || 'Математика',
        question: question,
        answer: 'x = 5',
        steps: [
          'Упрощаем уравнение: 2x + 3 = 13',
          'Переносим 3 в правую часть: 2x = 13 - 3',
          'Вычисляем: 2x = 10',
          'Делим обе части на 2: x = 10 ÷ 2',
          'Получаем ответ: x = 5'
        ],
        timestamp: new Date(),
      };
      
      setCurrentSolution(mockSolution);
      setHistory(prev => [mockSolution, ...prev]);
      setLoading(false);
      
      toast({
        title: 'Решение готово!',
        description: 'Задача успешно решена',
      });
    }, 1500);
  };

  const selectedSubject = subjects.find(s => s.value === subject);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Icon name="GraduationCap" className="text-white" size={28} />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Решатель Задач
            </h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Мгновенное решение школьных задач с подробным объяснением
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6 animate-scale-in">
            <Card className="shadow-lg border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="PenTool" className="text-primary" size={24} />
                  Введите условие задачи
                </CardTitle>
                <CardDescription>
                  Опишите задачу подробно, и я помогу найти решение
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Предмет</label>
                  <Select value={subject} onValueChange={setSubject}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subj => (
                        <SelectItem key={subj.value} value={subj.value}>
                          <div className="flex items-center gap-2">
                            <Icon name={subj.icon as any} size={18} />
                            <span>{subj.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Условие задачи</label>
                  <Textarea
                    placeholder="Например: Решите уравнение 2x + 3 = 13"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="min-h-[200px] text-base"
                  />
                </div>

                <Button 
                  onClick={handleSolve} 
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Icon name="Loader2" className="animate-spin mr-2" size={20} />
                      Решаю задачу...
                    </>
                  ) : (
                    <>
                      <Icon name="Sparkles" className="mr-2" size={20} />
                      Решить задачу
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 animate-scale-in">
            {currentSolution ? (
              <Card className="shadow-lg border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="CheckCircle" className="text-primary" size={24} />
                      Решение готово
                    </CardTitle>
                    <Badge className={selectedSubject?.color}>
                      {currentSolution.subject}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Условие:</p>
                    <p className="font-medium">{currentSolution.question}</p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Icon name="List" size={20} className="text-secondary" />
                      Пошаговое решение:
                    </h3>
                    <Accordion type="single" collapsible className="w-full">
                      {currentSolution.steps.map((step, index) => (
                        <AccordionItem key={index} value={`step-${index}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <span className="text-left">Шаг {index + 1}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="pl-8 pt-2 text-muted-foreground">
                              {step}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border-2 border-primary/20">
                    <p className="text-sm text-muted-foreground mb-1">Ответ:</p>
                    <p className="text-2xl font-bold text-primary">{currentSolution.answer}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Icon name="Brain" size={40} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Жду задачу</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Введите условие задачи слева, и я мгновенно предоставлю подробное решение
                  </p>
                </CardContent>
              </Card>
            )}

            {history.length > 0 && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="History" className="text-accent" size={24} />
                    История решений
                  </CardTitle>
                  <CardDescription>
                    Последние {history.length} решённых задач
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {history.slice(0, 5).map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg border hover:border-primary/50 cursor-pointer transition-all hover:shadow-md"
                        onClick={() => setCurrentSolution(item)}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.subject}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {item.timestamp.toLocaleTimeString('ru-RU', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{item.question}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <footer className="mt-16 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 text-sm">
            <Icon name="Sparkles" size={16} />
            <p>Создано с использованием искусственного интеллекта</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
