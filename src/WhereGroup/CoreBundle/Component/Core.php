<?php

namespace WhereGroup\CoreBundle\Component;

use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Twig_Environment;

/**
 * Class Core
 * @package WhereGroup\CoreBundle\Component
 */
class Core
{
    protected $templating;
    protected $translator;
    protected $security;
    protected $eventDispatcher;
    protected $authorizationChecker;

    /**
     * Core constructor.
     * @param Twig_Environment $templating
     * @param EventDispatcherInterface $eventDispatcher
     * @param TranslatorInterface $translator
     * @param AuthorizationCheckerInterface $authorizationChecker
     */
    public function __construct(
        Twig_Environment $templating,
        EventDispatcherInterface $eventDispatcher,
        TranslatorInterface $translator,
        AuthorizationCheckerInterface $authorizationChecker
    ) {
        $this->templating = $templating;
        $this->translator = $translator;
        $this->eventDispatcher = $eventDispatcher;
        $this->authorizationChecker = $authorizationChecker;
    }

    public function __destruct()
    {
        unset(
            $this->templating,
            $this->eventDispatcher,
            $this->translatorInterface,
            $this->authorizationChecker
        );
    }

    /**
     * @param $id
     * @param array $parameters
     * @param null $domain
     * @param null $locale
     * @return string
     */
    public function translate($id, array $parameters = array(), $domain = null, $locale = null)
    {
        return $this->translator->trans($id, $parameters, $domain, $locale);
    }

    /**
     * @param $name
     * @param array $context
     * @return string
     */
    public function render($name, array $context = array())
    {
        return $this->templating->render($name, $context);
    }

    /**
     * @param $attributes
     * @param null $object
     * @return bool
     */
    public function isGranted($attributes, $object = null)
    {
        return $this->authorizationChecker->isGranted($attributes, $object);
    }

    /**
     * @param $attributes
     * @param null $object
     * @param string $message
     */
    public function denyAccessUnlessGranted($attributes, $object = null, $message = 'Unable to access this page!')
    {
        if (!$this->authorizationChecker->isGranted($attributes, $object)) {
            throw new AccessDeniedException($message);
        }
    }
}
