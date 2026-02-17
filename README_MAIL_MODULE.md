# Module Mail - Documentation

## Structure

Le module Mail est organisé selon l'architecture Core avec séparation Actions/Services :

```
app/
├── Core/
│   └── Mailing/
│       ├── Actions/
│       │   └── MailAction.php          # Actions d'envoi d'emails
│       ├── Services/
│       │   ├── MailService.php         # Service principal d'envoi
│       │   └── BulkMailService.php     # Service d'envoi en masse
│       ├── Dto/
│       │   ├── MailDto.php             # DTO pour un email simple
│       │   └── BulkMailDto.php         # DTO pour emails en masse
│       └── Helpers/
│           └── MailHelper.php          # Helper pour faciliter l'utilisation
├── Mail/
│   ├── TemplateMail.php               # Mailable générique pour templates
│   ├── WelcomeMail.php                # Email de bienvenue
│   ├── OrderConfirmationMail.php      # Confirmation de commande
│   ├── OrderShippedMail.php           # Notification d'expédition
│   └── PasswordResetMail.php          # Réinitialisation de mot de passe
└── resources/
    └── views/
        └── emails/
            ├── layouts/
            │   └── base.blade.php      # Layout de base avec CSS inline
            ├── welcome.blade.php       # Template welcome
            ├── orders/
            │   ├── confirmation.blade.php
            │   └── shipped.blade.php
            ├── auth/
            │   └── password-reset.blade.php
            └── templates/
                └── default.blade.php   # Template générique
```

## Utilisation

### 1. Emails prédéfinis

#### Email de bienvenue
```php
use App\Core\Mailing\Helpers\MailHelper;

MailHelper::sendWelcome($user);
```

#### Confirmation de commande
```php
MailHelper::sendOrderConfirmation($order);
```

#### Notification d'expédition
```php
MailHelper::sendOrderShipped($order);
```

#### Réinitialisation de mot de passe
```php
MailHelper::sendPasswordReset(
    email: $user->email,
    resetUrl: route('password.reset', ['token' => $token]),
    expirationMinutes: 60
);
```

### 2. Email personnalisé avec template

```php
MailHelper::sendCustom(
    to: 'user@example.com',
    subject: 'Subject',
    template: 'default', // Nom du template dans resources/views/emails/templates/
    data: [
        'title' => 'Hello',
        'content' => 'This is a custom email',
        'buttonText' => 'Click Here',
        'buttonUrl' => 'https://example.com',
    ]
);
```

### 3. Email en queue

```php
MailHelper::queueCustom(
    to: 'user@example.com',
    subject: 'Subject',
    template: 'default',
    data: ['title' => 'Hello'],
    queue: 'emails' // Optionnel
);
```

### 4. Emails en masse avec personnalisation

```php
$results = MailHelper::sendBulk(
    recipients: ['user1@example.com', 'user2@example.com'],
    subject: 'Newsletter',
    template: 'default',
    commonData: [
        'title' => 'Newsletter',
        'appName' => config('app.name'),
    ],
    personalizedData: [
        'user1@example.com' => ['name' => 'John'],
        'user2@example.com' => ['name' => 'Jane'],
    ]
);

// $results contient: ['sent' => 2, 'failed' => 0, 'errors' => []]
```

### 5. Utilisation directe des Services

```php
use App\Core\Mailing\Dto\MailDto;
use App\Core\Mailing\Services\MailService;

$dto = new MailDto(
    to: 'user@example.com',
    subject: 'Subject',
    template: 'default',
    data: ['title' => 'Hello'],
    from: 'noreply@example.com',
    fromName: 'My App',
    cc: ['cc@example.com'],
    bcc: ['bcc@example.com'],
);

app(MailService::class)->send($dto);
```

## Templates

Tous les templates utilisent le layout de base (`emails.layouts.base`) qui inclut :
- CSS inline pour compatibilité email
- Design responsive
- Support Outlook (commentaires conditionnels)
- Footer avec informations de l'application

### Créer un nouveau template

1. Créer le fichier Blade dans `resources/views/emails/`
2. Étendre le layout de base :
```blade
@extends('emails.layouts.base')

@section('content')
    <!-- Votre contenu ici -->
@endsection
```

3. Utiliser les variables passées dans `$data`

## Configuration

Assurez-vous que votre fichier `.env` contient :
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourapp.com
MAIL_FROM_NAME="${APP_NAME}"
```

## Queue

Pour utiliser les queues, configurez dans `.env` :
```env
QUEUE_CONNECTION=database
```

Puis créez la table de queue :
```bash
php artisan queue:table
php artisan migrate
```

Lancez le worker :
```bash
php artisan queue:work
```

## Personnalisation

### Modifier le layout de base

Éditez `resources/views/emails/layouts/base.blade.php` pour changer :
- Couleurs (gradients, backgrounds)
- Typographie
- Structure générale

### Ajouter de nouveaux types de mails

1. Créer une classe Mailable dans `app/Mail/`
2. Créer le template Blade correspondant
3. Ajouter une méthode dans `MailHelper` si nécessaire

## Notes importantes

- Tous les templates utilisent du CSS inline pour une meilleure compatibilité avec les clients email
- Le layout de base est optimisé pour les principaux clients (Gmail, Outlook, Apple Mail)
- Les emails en masse sont envoyés par batches pour éviter la surcharge
- Tous les échecs sont loggés automatiquement
