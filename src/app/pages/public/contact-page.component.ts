import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle } from 'lucide-angular';

@Component({
    selector: 'app-contact-page',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    template: `
    <div class="min-h-screen">
      <!-- Hero -->
      <section class="bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center max-w-3xl mx-auto">
            <div class="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">Contact</div>
            <h1 class="mb-6">Need help? <span class="text-primary">Contact us</span></h1>
            <p class="text-xl text-muted-foreground">Our team is here to answer all your questions and support you in your StreetLeague experience.</p>
          </div>
        </div>
      </section>

      <!-- Contact Info & Form -->
      <section class="py-20 bg-card">
        <div class="max-w-7xl mx-auto px-4">
          <div class="grid lg:grid-cols-3 gap-8">
            <!-- Contact Cards -->
            <div class="space-y-6">
              <div class="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-all">
                <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4"><lucide-icon [img]="MailIcon" class="w-6 h-6 text-primary"></lucide-icon></div>
                <h3 class="mb-2">Email</h3>
                <p class="text-muted-foreground mb-3">Send us an email, we reply in less than 24h</p>
                <a href="mailto:contact@streetleague.com" class="text-primary font-semibold hover:underline">contact@streetleague.com</a>
              </div>
              <div class="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-all">
                <div class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4"><lucide-icon [img]="PhoneIcon" class="w-6 h-6 text-accent"></lucide-icon></div>
                <h3 class="mb-2">Phone</h3>
                <p class="text-muted-foreground mb-3">Call us Monday to Friday</p>
                <a href="tel:+33123456789" class="text-primary font-semibold hover:underline">+33 1 23 45 67 89</a>
              </div>
              <div class="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-all">
                <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4"><lucide-icon [img]="ClockIcon" class="w-6 h-6 text-primary"></lucide-icon></div>
                <h3 class="mb-2">Hours</h3>
                <p class="text-muted-foreground">Monday - Friday<br/>9:00 AM - 6:00 PM</p>
              </div>
              <div class="bg-background rounded-2xl p-6 border border-border hover:shadow-lg transition-all">
                <div class="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4"><lucide-icon [img]="MapPinIcon" class="w-6 h-6 text-accent"></lucide-icon></div>
                <h3 class="mb-2">Address</h3>
                <p class="text-muted-foreground">123 Sport Avenue<br/>75001 Paris, France</p>
              </div>
            </div>

            <!-- Form -->
            <div class="lg:col-span-2">
              <div class="bg-background rounded-2xl p-8 border border-border">
                <div class="mb-8">
                  <h2 class="mb-3">Send us a message</h2>
                  <p class="text-muted-foreground">Fill out the form below and we will get back to you as soon as possible.</p>
                </div>
                <div *ngIf="submitted" class="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6 text-primary font-semibold">
                  ✓ Message sent! We will get back to you within 24 hours.
                </div>
                <form (ngSubmit)="handleSubmit()" class="space-y-6">
                  <div class="grid md:grid-cols-2 gap-6">
                    <div>
                      <label for="name" class="block mb-2">Full name</label>
                      <input id="name" type="text" [(ngModel)]="name" name="name" placeholder="John Doe" required class="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                    <div>
                      <label for="email" class="block mb-2">Email</label>
                      <input id="email" type="email" [(ngModel)]="email" name="email" placeholder="john@example.com" required class="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                    </div>
                  </div>
                  <div>
                    <label for="subject" class="block mb-2">Subject</label>
                    <input id="subject" type="text" [(ngModel)]="subject" name="subject" placeholder="How can I help you?" required class="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all" />
                  </div>
                  <div>
                    <label for="message" class="block mb-2">Message</label>
                    <textarea id="message" [(ngModel)]="message" name="message" placeholder="Describe your request..." required rows="6" class="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"></textarea>
                  </div>
                  <button type="submit" class="w-full bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                    <lucide-icon [img]="SendIcon" class="w-5 h-5"></lucide-icon>
                    Send message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="py-20 bg-background">
        <div class="max-w-7xl mx-auto px-4">
          <div class="text-center mb-16">
            <div class="inline-block px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">FAQ</div>
            <h2 class="mb-4">Frequently Asked Questions</h2>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto">Quickly find answers to the most common questions</p>
          </div>
          <div class="max-w-3xl mx-auto space-y-4">
            <div *ngFor="let faq of faqs" class="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-all">
              <div class="flex items-start gap-4">
                <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <lucide-icon [img]="HelpCircleIcon" class="w-5 h-5 text-primary"></lucide-icon>
                </div>
                <div>
                  <h3 class="mb-2">{{ faq.question }}</h3>
                  <p class="text-muted-foreground">{{ faq.answer }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class ContactPageComponent {
    readonly MailIcon = Mail;
    readonly PhoneIcon = Phone;
    readonly MapPinIcon = MapPin;
    readonly ClockIcon = Clock;
    readonly SendIcon = Send;
    readonly HelpCircleIcon = HelpCircle;

    name = '';
    email = '';
    subject = '';
    message = '';
    submitted = false;

    handleSubmit() {
        this.submitted = true;
        this.name = '';
        this.email = '';
        this.subject = '';
        this.message = '';
        setTimeout(() => { this.submitted = false; }, 5000);
    }

    faqs = [
        { question: 'How to create an account?', answer: "Click on \"Sign Up\" at the top of the page, fill out the form and choose your account type." },
        { question: 'How to book a field?', answer: 'Browse available fields, select the one that suits you, choose a date and time, then confirm your booking.' },
        { question: 'What payment methods are accepted?', answer: 'We accept credit cards (Visa, Mastercard), PayPal and bank transfers.' },
        { question: 'How to add my field on the platform?', answer: 'Create an owner account, access your dashboard and click on "Add a field".' },
        { question: 'Can I cancel a booking?', answer: "Yes, you can cancel for free up to 24 hours before the booking starts." },
    ];
}
