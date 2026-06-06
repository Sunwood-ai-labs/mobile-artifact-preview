<?php

declare(strict_types=1);

namespace OCA\StructuredViewer\Listeners;

use OCA\StructuredViewer\AppInfo\Application;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\IConfig;
use OCP\Util;

class LoadGlobalThemeListener implements IEventListener {
    public function __construct(
        private IConfig $config,
    ) {
    }

    public function handle(Event $event): void {
        if (!$event instanceof BeforeTemplateRenderedEvent || !$event->isLoggedIn()) {
            return;
        }

        Util::addStyle(Application::APP_ID, 'structuredviewer-v17');
        Util::addHeader('style', [
            'id' => 'structuredviewer-global-theme-vars',
        ], sprintf(
            ':root{--sv-global-background-color:#070810;--sv-global-background-image:%s;--sv-global-mobile-background-image:%s;--sv-accent:%s;--sv-highlight:%s;}',
            $this->cssUrl($this->config->getAppValue(Application::APP_ID, 'background_image', '')),
            $this->cssUrl($this->config->getAppValue(Application::APP_ID, 'mobile_background_image', $this->config->getAppValue(Application::APP_ID, 'background_image', ''))),
            $this->config->getAppValue(Application::APP_ID, 'accent', '#32c7f4'),
            $this->config->getAppValue(Application::APP_ID, 'highlight', '#d98545'),
        ));
    }

    private function cssUrl(string $value): string {
        $raw = trim($value);
        if ($raw === '' || strtolower($raw) === 'none') {
            return 'none';
        }

        return 'url(' . str_replace(['\\', '"', "'", '(', ')', "\n", "\r"], ['\\\\', '', '', '\\(', '\\)', '', ''], $raw) . ')';
    }
}
