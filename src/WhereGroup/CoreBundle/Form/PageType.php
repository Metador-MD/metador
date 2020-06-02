<?php

namespace WhereGroup\CoreBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Regex;

/**
 * Class PageType
 * @package WhereGroup\CoreBundle\Form
 */
class PageType extends AbstractType
{
    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('slug', TextType::class, [
                'label' => 'Slug',
                'constraints' => [
                    new NotBlank(['message' => 'Slug darf nicht leer sein.']),
                    new Regex(['pattern' => '/^[a-z]+$/', 'message' => 'Slug darf nur aus Kleinbuchstaben bestehen.']),
                ]
            ])
            ->add('link', TextType::class, [
                'label' => 'Link',
            ])
            ->add('markdown', TextareaType::class, [
                'label' => 'Seiteninhalt',
            ])
        ;
    }
}
