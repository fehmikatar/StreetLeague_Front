import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Textarea } from '@/app/components/ui/textarea';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    toast.success('Message envoyé ! Nous vous répondrons dans les 24 heures.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
              Contact
            </div>
            <h1 className="mb-6">
              Besoin d'aide ? <span className="text-primary">Contactez-nous</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Notre équipe est là pour répondre à toutes vos questions et vous accompagner dans
              votre expérience StreetLeague.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Cards */}
            <div className="space-y-6">
              <div className="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mb-2">Email</h3>
                <p className="text-muted-foreground mb-3">
                  Envoyez-nous un email, nous répondons en moins de 24h
                </p>
                <a
                  href="mailto:contact@streetleague.fr"
                  className="text-primary font-semibold hover:underline"
                >
                  contact@streetleague.fr
                </a>
              </div>

              <div className="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-accent" />
                </div>
                <h3 className="mb-2">Téléphone</h3>
                <p className="text-muted-foreground mb-3">
                  Appelez-nous du lundi au vendredi
                </p>
                <a
                  href="tel:+33123456789"
                  className="text-primary font-semibold hover:underline"
                >
                  +33 1 23 45 67 89
                </a>
              </div>

              <div className="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mb-2">Horaires</h3>
                <p className="text-muted-foreground">
                  Lundi - Vendredi<br />
                  9h00 - 18h00
                </p>
              </div>

              <div className="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-all">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <h3 className="mb-2">Adresse</h3>
                <p className="text-muted-foreground">
                  123 Avenue du Sport<br />
                  75001 Paris, France
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-background rounded-2xl p-8 border border-border">
                <div className="mb-8">
                  <h2 className="mb-3">Envoyez-nous un message</h2>
                  <p className="text-muted-foreground">
                    Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus
                    brefs délais.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block mb-2">
                        Nom complet
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block mb-2">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block mb-2">
                      Sujet
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="Comment puis-je vous aider ?"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Décrivez votre demande..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-6 flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Envoyer le message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
              FAQ
            </div>
            <h2 className="mb-4">Questions fréquentes</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Trouvez rapidement les réponses aux questions les plus courantes
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: 'Comment créer un compte ?',
                answer: 'Cliquez sur "S\'inscrire" en haut de la page, remplissez le formulaire avec vos informations et choisissez votre type de compte (joueur ou propriétaire).',
              },
              {
                question: 'Comment réserver un terrain ?',
                answer: 'Parcourez les terrains disponibles, sélectionnez celui qui vous convient, choisissez une date et un horaire, puis confirmez votre réservation.',
              },
              {
                question: 'Quels sont les moyens de paiement acceptés ?',
                answer: 'Nous acceptons les cartes bancaires (Visa, Mastercard), PayPal et les virements bancaires pour les propriétaires de terrains.',
              },
              {
                question: 'Comment ajouter mon terrain sur la plateforme ?',
                answer: 'Créez un compte propriétaire, accédez à votre tableau de bord et cliquez sur "Ajouter un terrain". Remplissez les informations nécessaires et soumettez votre demande.',
              },
              {
                question: 'Puis-je annuler une réservation ?',
                answer: 'Oui, vous pouvez annuler gratuitement jusqu\'à 24h avant le début de la réservation. Les annulations tardives peuvent entraîner des frais.',
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Vous ne trouvez pas votre réponse ?</p>
            <Button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-6 py-3 inline-flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Contactez notre support
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
