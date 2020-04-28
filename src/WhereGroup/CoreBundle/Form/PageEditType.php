<?php

namespace WhereGroup\CoreBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\NotBlank;

/**
 * Class PageType
 * @package WhereGroup\CoreBundle\Form
 */
class PageEditType extends AbstractType
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
                'attr' => [
                    'readonly' => true,
                ],
                'constraints' => [new NotBlank(['message' => 'Slug darf nicht leer sein.'])]
            ])
            ->add('markdown', TextareaType::class, [
                'label'    => 'Seiteninhalt',
                'constraints' => [new NotBlank(['message' => 'Seiteninhalt darf nicht leer sein.'])]
            ])
        ;
    }
}
